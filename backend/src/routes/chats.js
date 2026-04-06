const express = require('express');
const router = express.Router();
const { getCurrent, addMessages, clearCurrent } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/current', protect, getCurrent);
router.post('/current/messages', protect, addMessages);
router.delete('/current', protect, clearCurrent);

module.exports = router;
