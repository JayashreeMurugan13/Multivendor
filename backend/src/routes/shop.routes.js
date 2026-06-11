const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/shop.controller');

router.get('/products/featured', ctrl.getFeatured);
router.get('/products', ctrl.getProducts);
router.get('/products/:slug', ctrl.getProduct);
router.get('/categories', ctrl.getCategories);
router.get('/banners', ctrl.getBanners);

module.exports = router;
