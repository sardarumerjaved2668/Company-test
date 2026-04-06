const express = require('express');
const router = express.Router();
const { getAgents } = require('../controllers/agentController');

router.get('/', getAgents);

module.exports = router;
