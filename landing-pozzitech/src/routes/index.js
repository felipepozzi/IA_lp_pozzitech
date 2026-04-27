const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
router.get('/privacidade', homeController.privacy);
router.get('/termos', homeController.terms);

module.exports = router;
