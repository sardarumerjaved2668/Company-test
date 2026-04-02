const AIModel = require('../models/AIModel');

exports.getAllModels = async (req, res, next) => {
  try {
    const { search, category, tier, openSource, page = 1, limit = 50 } = req.query;
    const q = { isActive: true };
    if (search) q.$text = { $search: search };
    if (category && category !== 'All') q.categories = category;
    if (tier) q['pricing.tier'] = tier;
    if (openSource === 'true') q.openSource = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [models, total] = await Promise.all([
      AIModel.find(q).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      AIModel.countDocuments(q),
    ]);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), models });
  } catch (err) { next(err); }
};

exports.getModelById = async (req, res, next) => {
  try {
    const model = await AIModel.findOne({ _id: req.params.id, isActive: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) { next(err); }
};

exports.getModelBySlug = async (req, res, next) => {
  try {
    const model = await AIModel.findOne({ slug: req.params.slug, isActive: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) { next(err); }
};

exports.createModel = async (req, res, next) => {
  try {
    const model = await AIModel.create(req.body);
    res.status(201).json({ success: true, model });
  } catch (err) { next(err); }
};

exports.updateModel = async (req, res, next) => {
  try {
    const model = await AIModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, model });
  } catch (err) { next(err); }
};

exports.deleteModel = async (req, res, next) => {
  try {
    const model = await AIModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
    res.json({ success: true, message: 'Model removed' });
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const cats = await AIModel.distinct('categories', { isActive: true });
    res.json({ success: true, categories: ['All', ...cats.sort()] });
  } catch (err) { next(err); }
};
