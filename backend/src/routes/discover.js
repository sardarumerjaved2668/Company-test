const express = require('express');
const router = express.Router();
const { getDiscoverItems } = require('../controllers/discoverController');

router.get('/', getDiscoverItems);

module.exports = router;
