'use strict';

const express = require('express');
const router = express.Router();
const { handleInit, handleMessage } = require('../controllers/chatController');

router.get('/init', handleInit);
router.post('/', handleMessage);

module.exports = router;
