const express = require('express');
const router = express.Router();
const { recommend, getHistory, clearHistory } = require('../controllers/recommendController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, recommend);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);

module.exports = router;
