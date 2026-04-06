const Agent = require('../models/Agent');
const UserAgent = require('../models/UserAgent');
const AgentTask = require('../models/AgentTask');
const WorkbenchSuggestion = require('../models/WorkbenchSuggestion');
const {
  CATEGORIES,
  paginateMemory,
} = require('../data/workbenchSuggestions');
const workbenchToolbar = require('../data/workbenchToolbar');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getWorkbenchToolbar = (req, res) => {
  res.json({ success: true, data: { actions: workbenchToolbar } });
};

exports.getAgents = async (req, res, next) => {
  try {
    const qTrim = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const usePagination =
      req.query.page != null || req.query.pageSize != null || qTrim.length > 0;

    if (!usePagination) {
      const agents = await Agent.find({ isSystem: true }).sort({ createdAt: 1 });
      return res.json({ success: true, data: { agents } });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const filter = { isSystem: true };
    if (qTrim) {
      filter.$or = [
        { title: { $regex: escapeRegex(qTrim), $options: 'i' } },
        { description: { $regex: escapeRegex(qTrim), $options: 'i' } },
        { templateId: { $regex: escapeRegex(qTrim), $options: 'i' } },
        { model: { $regex: escapeRegex(qTrim), $options: 'i' } },
      ];
    }
    const total = await Agent.countDocuments(filter);
    const skip = (page - 1) * pageSize;
    const agents = await Agent.find(filter).sort({ createdAt: 1 }).skip(skip).limit(pageSize).lean();
    res.json({
      success: true,
      data: {
        agents,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) { next(err); }
};

/** Suggestions: MongoDB WorkbenchSuggestion when seeded; else in-memory fallback with pagination */
exports.getSuggestions = async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    let category = typeof req.query.category === 'string' ? req.query.category : 'use_cases';
    if (!CATEGORIES.includes(category)) category = 'use_cases';
    const shuffle = req.query.shuffle === '1' || req.query.shuffle === 'true';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const dbCount = await WorkbenchSuggestion.countDocuments({});
    if (dbCount > 0) {
      const mongoFilter = { category };
      if (q) {
        mongoFilter.text = { $regex: escapeRegex(q), $options: 'i' };
      }
      const total = await WorkbenchSuggestion.countDocuments(mongoFilter);
      let docs;
      if (shuffle) {
        const all = await WorkbenchSuggestion.find(mongoFilter).sort({ order: 1, text: 1 }).lean();
        const arr = [...all];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const skip = (page - 1) * pageSize;
        docs = arr.slice(skip, skip + pageSize);
      } else {
        const skip = (page - 1) * pageSize;
        docs = await WorkbenchSuggestion.find(mongoFilter)
          .sort({ order: 1, text: 1 })
          .skip(skip)
          .limit(pageSize)
          .lean();
      }
      const suggestions = docs.map((d) => ({
        id: d.suggestionId,
        icon: d.icon,
        text: d.text,
      }));
      return res.json({
        success: true,
        data: {
          suggestions,
          totalMatches: total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
          categories: CATEGORIES,
          category,
          source: 'db',
        },
      });
    }

    const mem = paginateMemory(category, q, page, pageSize, shuffle);
    return res.json({
      success: true,
      data: {
        suggestions: mem.suggestions,
        totalMatches: mem.totalMatches,
        page: mem.page,
        pageSize: mem.pageSize,
        totalPages: mem.totalPages,
        categories: CATEGORIES,
        category: mem.category,
        source: 'memory',
      },
    });
  } catch (err) { next(err); }
};

async function ensureDefaultUserAgent(userId) {
  const n = await UserAgent.countDocuments({ user: userId });
  if (n > 0) return;
  const template = await Agent.findOne({ templateId: 'research' });
  await UserAgent.create({
    user: userId,
    name: 'Default Assistant',
    templateId: template?.templateId || 'research',
    purpose: template?.description || 'Automates research and summarises findings.',
    systemPrompt: '',
    model: template?.model || 'GPT-4o',
    tags: template?.tags?.length ? template.tags : ['Research', 'Reports'],
    icon: template?.icon || '🔬',
    isDefault: true,
  });
}

exports.getMyAgentsPaginated = async (req, res, next) => {
  try {
    await ensureDefaultUserAgent(req.user._id);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const sortBy = req.query.sortBy === 'name' ? 'name' : 'updatedAt';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    const filter = { user: req.user._id };
    if (q) {
      filter.$or = [
        { name: { $regex: escapeRegex(q), $options: 'i' } },
        { model: { $regex: escapeRegex(q), $options: 'i' } },
        { templateId: { $regex: escapeRegex(q), $options: 'i' } },
        { purpose: { $regex: escapeRegex(q), $options: 'i' } },
      ];
    }
    const total = await UserAgent.countDocuments(filter);
    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: sortDir };
    const userAgents = await UserAgent.find(filter).sort(sort).skip(skip).limit(pageSize).lean();
    res.json({
      success: true,
      data: {
        userAgents,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) { next(err); }
};

exports.getMyWorkspace = async (req, res, next) => {
  try {
    await ensureDefaultUserAgent(req.user._id);
    const userAgents = await UserAgent.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    const ids = userAgents.map((a) => a._id);
    const tasks = await AgentTask.find({ user: req.user._id, agent: { $in: ids } }).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, data: { userAgents, tasks } });
  } catch (err) { next(err); }
};

exports.createMyAgent = async (req, res, next) => {
  try {
    const { name, templateId, purpose, systemPrompt, model, tags, icon } = req.body;
    const payload = {
      user: req.user._id,
      name: name.trim(),
      templateId: templateId || '',
      purpose: purpose || '',
      systemPrompt: systemPrompt || '',
      model: model.trim(),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).slice(0, 40)).filter(Boolean) : [],
      icon: icon || '🤖',
      isDefault: false,
    };
    const created = await UserAgent.create(payload);
    res.status(201).json({ success: true, data: { userAgent: created } });
  } catch (err) { next(err); }
};

exports.updateMyAgent = async (req, res, next) => {
  try {
    const agent = await UserAgent.findOne({ _id: req.params.id, user: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });

    const { name, purpose, systemPrompt, model, tags, icon, isDefault } = req.body;
    if (name !== undefined) agent.name = String(name).trim().slice(0, 80);
    if (purpose !== undefined) agent.purpose = String(purpose).slice(0, 4000);
    if (systemPrompt !== undefined) agent.systemPrompt = String(systemPrompt).slice(0, 8000);
    if (model !== undefined) agent.model = String(model).trim().slice(0, 80);
    if (tags !== undefined) agent.tags = Array.isArray(tags) ? tags.map((t) => String(t).slice(0, 40)).filter(Boolean) : [];
    if (icon !== undefined) agent.icon = String(icon).slice(0, 8);
    if (isDefault === true) {
      await UserAgent.updateMany({ user: req.user._id, _id: { $ne: agent._id } }, { $set: { isDefault: false } });
      agent.isDefault = true;
    }
    await agent.save();
    res.json({ success: true, data: { userAgent: agent } });
  } catch (err) { next(err); }
};

exports.deleteMyAgent = async (req, res, next) => {
  try {
    const agent = await UserAgent.findOne({ _id: req.params.id, user: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });
    if (agent.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete the default agent.' });
    }
    await AgentTask.deleteMany({ user: req.user._id, agent: agent._id });
    await agent.deleteOne();
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const agent = await UserAgent.findOne({ _id: req.params.agentId, user: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });
    const { title } = req.body;
    const last = await AgentTask.findOne({ user: req.user._id, agent: agent._id }).sort({ sortOrder: -1 });
    const sortOrder = last ? last.sortOrder + 1 : 0;
    const task = await AgentTask.create({
      user: req.user._id,
      agent: agent._id,
      title: title.trim(),
      done: false,
      sortOrder,
    });
    res.status(201).json({ success: true, data: { task } });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await AgentTask.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    const { title, done } = req.body;
    if (title !== undefined) task.title = String(title).trim().slice(0, 200);
    if (done !== undefined) task.done = Boolean(done);
    await task.save();
    res.json({ success: true, data: { task } });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await AgentTask.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    await task.deleteOne();
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
};
