const Agent = require('../models/Agent');

exports.getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find({ isSystem: true }).sort({ createdAt: 1 });
    res.json({ success: true, agents });
  } catch (err) { next(err); }
};
