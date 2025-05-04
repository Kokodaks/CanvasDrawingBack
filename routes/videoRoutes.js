const express = require('express');
const router = express.Router();
const { downloadVideo } = require('../controller/videoController');

// GET → POST로 변경
router.post('/download', downloadVideo);

module.exports = router;
