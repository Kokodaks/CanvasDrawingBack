const express = require('express');
const router = express.Router();
const reconController = require('../controller/reconController');
const multer = require('multer');
const upload = multer();

router.post('/sendStrokeData', 
    upload.fields([
        {name: 'drawing'},
        {name: 'finalDrawing'}
    ])
    , reconController.createStrokeData);
// router.get('/getJsonData', reconController.getJsonData);
// router.get('/getSvgData', reconController.getSvgData);

router.post('/findFinalStrokeData', reconController.findFinalStrokeData);



module.exports = router;