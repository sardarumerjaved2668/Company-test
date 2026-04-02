const AIModel = require('../models/AIModel');
const User = require('../models/User');
const { getRecommendations } = require('../utils/recommendation');

exports.recommend = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 4)
      return res.status(400).json({ success: false, message: 'Query must be at least 4 characters' });

    const models = await AIModel.find({ isActive: true });
    const results = getRecommendations(query, models, 3);

    if (req.user && results.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          recommendationHistory: {
            $each: [{ query, results: results.map((r) => ({ modelId: r.model._id, modelName: r.model.name, matchPercentage: r.matchPercentage })) }],
            $slice: -20,
          },
        },
      });
    }

    res.json({ success: true, query, results });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('recommendationHistory');
    res.json({ success: true, history: [...(user.recommendationHistory || [])].reverse() });
  } catch (err) { next(err); }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { recommendationHistory: [] });
    res.json({ success: true, message: 'History cleared' });
  } catch (err) { next(err); }
};
