const DiscoverItem = require('../models/DiscoverItem');

exports.getDiscoverItems = async (req, res, next) => {
  try {
    const items = await DiscoverItem.find().sort({ publishDate: -1 }).limit(20);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};
