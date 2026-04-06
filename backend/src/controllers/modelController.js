const AIModel = require('../models/AIModel');
const { tabCounts } = require('../utils/marketplaceTabCounts');

function buildModelQuery(req) {
  const {
    search,
    category,
    categoryMode,
    tier,
    tiers,
    openSource,
    provider,
    providers,
    maxInputPrice,
  } = req.query;

  const and = [{ isActive: true }];

  if (search && String(search).trim()) {
    const s = String(search).trim();
    const rx = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    and.push({
      $or: [
        { name: rx },
        { provider: rx },
        { description: rx },
        { categories: rx },
      ],
    });
  }

  if (category && category !== 'All') {
    and.push({ categories: category });
  }

  const modeMap = {
    language: 'Text',
    vision: 'Multimodal',
    code: 'Code',
    imageGen: 'Image',
    audio: 'Audio',
  };
  if (categoryMode && modeMap[categoryMode]) {
    const rx = new RegExp(modeMap[categoryMode].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    and.push({ categories: rx });
  }

  if (openSource === 'true') {
    and.push({ openSource: true });
  }

  const tierList = tiers
    ? String(tiers)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : null;
  if (tierList && tierList.length) {
    and.push({ 'pricing.tier': { $in: tierList } });
  } else if (tier) {
    and.push({ 'pricing.tier': tier });
  }

  const provList = providers
    ? String(providers)
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
    : null;
  if (provList && provList.length) {
    and.push({ provider: { $in: provList } });
  } else if (provider) {
    and.push({ provider });
  }

  if (maxInputPrice != null && maxInputPrice !== '') {
    const n = Number(maxInputPrice);
    if (!Number.isNaN(n)) {
      and.push({ 'pricing.input': { $lte: n } });
    }
  }

  return and.length === 1 ? and[0] : { $and: and };
}

exports.getAllModels = async (req, res, next) => {
  try {
    const { page = 1, limit = 120 } = req.query;
    const q = buildModelQuery(req);
    const skip = (Number(page) - 1) * Number(limit);
    const [models, total] = await Promise.all([
      AIModel.find(q).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      AIModel.countDocuments(q),
    ]);
    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      models,
    });
  } catch (err) {
    next(err);
  }
};

exports.getModelStats = async (req, res, next) => {
  try {
    const base = { isActive: true };
    const total = await AIModel.countDocuments(base);
    const byProvider = await AIModel.aggregate([
      { $match: base },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      success: true,
      total,
      byProvider: byProvider.map((x) => ({ provider: x._id, count: x.count })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getModelById = async (req, res, next) => {
  try {
    const model = await AIModel.findOne({ _id: req.params.id, isActive: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) {
    next(err);
  }
};

exports.getModelBySlug = async (req, res, next) => {
  try {
    const model = await AIModel.findOne({ slug: req.params.slug, isActive: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) {
    next(err);
  }
};

exports.createModel = async (req, res, next) => {
  try {
    const model = await AIModel.create(req.body);
    res.status(201).json({ success: true, model });
  } catch (err) {
    next(err);
  }
};

exports.updateModel = async (req, res, next) => {
  try {
    const model = await AIModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) {
    next(err);
  }
};

exports.deleteModel = async (req, res, next) => {
  try {
    const model = await AIModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, message: 'Model removed' });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const cats = await AIModel.distinct('categories', { isActive: true });
    res.json({ success: true, categories: ['All', ...cats.sort()] });
  } catch (err) {
    next(err);
  }
};

/** Counts per marketplace tab (All, Language, Vision, …) — from live DB */
exports.getMarketplaceTabCounts = async (req, res, next) => {
  try {
    const models = await AIModel.find({ isActive: true })
      .select('categories openSource')
      .lean();
    res.json({
      success: true,
      total: models.length,
      tabs: tabCounts(models),
    });
  } catch (err) {
    next(err);
  }
};
