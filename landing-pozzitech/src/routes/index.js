const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
router.get('/geo', homeController.geo);
router.get('/privacidade', homeController.privacy);
router.get('/termos', homeController.terms);
router.get('/sitemap.xml', homeController.sitemap);

module.exports = router;
