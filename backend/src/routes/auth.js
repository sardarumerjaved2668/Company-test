const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, refresh, getSession } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/refresh', refresh);
router.get('/session', protect, getSession);

module.exports = router;
