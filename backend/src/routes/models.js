const express = require('express');
const router = express.Router();
const {
  getAllModels,
  getModelById,
  getModelBySlug,
  createModel,
  updateModel,
  deleteModel,
  getCategories,
  getModelStats,
  getMarketplaceTabCounts,
} = require('../controllers/modelController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', getAllModels);
router.get('/stats', getModelStats);
router.get('/categories', getCategories);
router.get('/marketplace-tabs', getMarketplaceTabCounts);
router.get('/slug/:slug', getModelBySlug);
router.get('/:id', getModelById);
router.post('/', protect, restrictTo('admin'), createModel);
router.put('/:id', protect, restrictTo('admin'), updateModel);
router.delete('/:id', protect, restrictTo('admin'), deleteModel);

module.exports = router;
