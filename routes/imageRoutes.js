const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');

router.get('/download', imageController.downloadImage);

module.exports = router;