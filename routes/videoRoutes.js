const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controller/videoController');

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.body;
    if (!id) return cb(new Error('id가 필요합니다'), null);

    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, '..', 'downloads', id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 원본 이름 그대로 저장
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('video'), videoController.uploadVideo);

module.exports = router;
