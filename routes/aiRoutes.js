const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const aiController = require('../controller/aiController');

router.post('/sendFinalToOpenAi',
    upload.fields([
        {name: 'finalDrawing'},
        {name: 'finalImage'}
    ]),
    aiController.sendFinalToOpenAi);

module.exports = router;


