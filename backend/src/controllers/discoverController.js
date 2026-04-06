const DiscoverItem = require('../models/DiscoverItem');
const { toDiscoverItemDto } = require('../utils/discoverDto');

const ALLOWED = ['reasoning', 'multimodal', 'alignment', 'efficiency', 'open_weights'];

exports.getDiscoverItems = async (req, res, next) => {
  try {
    const cat = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';
    const filter = cat && cat !== 'all' && ALLOWED.includes(cat) ? { category: cat } : {};
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 30));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [items, papersThisWeek] = await Promise.all([
      DiscoverItem.find(filter).sort({ publishDate: -1 }).limit(limit).lean(),
      DiscoverItem.countDocuments({ publishDate: { $gte: weekAgo } }),
    ]);

    const payload = items.map((doc) => toDiscoverItemDto(doc));

    res.json({
      success: true,
      items: payload,
      count: payload.length,
      papersThisWeek,
    });
  } catch (err) {
    next(err);
  }
};
