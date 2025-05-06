const express = require('express');
const router = express.Router();
const reconController = require('../controller/reconController');

router.post('/sendStrokeData', reconController.createStrokeData);
// router.get('/getJsonData', reconController.getJsonData);
// router.get('/getSvgData', reconController.getSvgData);

module.exports = router;