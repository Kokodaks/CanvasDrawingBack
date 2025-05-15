const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controller/videoController');
const path = require('path'); // ✅ 필수!
const fs = require('fs');

let storage;
let upload;

// Multer 설정
if(process.env.NODE_ENV === 'production'){
  //서버 환경 (s3 저장용)
  storage = multer.memoryStorage();
  upload = multer({storage: multer.memoryStorage()});

}else{
  //테스트 (프로젝트 내부에 경로 저장용)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { testId, type } = req.body;
      if (!testId || !type) return cb(new Error('testId와 type이 필요합니다'), null);
  
      const dir = path.join(__dirname, '..', 'downloads', testId, type, 'video');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const { testId, type } = req.body;
      const ext = path.extname(file.originalname) || '.mp4';
      const filename = `${testId}_${type}${ext}`;
      cb(null, filename); // 예: 123_house.mp4
    }
  });
  
  
  upload = multer({ storage });
}

//비디오 업로드
router.post('/upload', upload.single('video'), videoController.uploadVideo);

//비디오 뷰어
router.get('/view/:testId/:type/:filename', (req, res) => {
  const { testId, type, filename } = req.params;
  const filePath = path.join(__dirname, '..', 'downloads', testId, type, 'video', filename);

  // 파일 존재 여부 확인
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('❌ 파일을 찾을 수 없습니다.');
  }

  // 비디오 스트리밍 설정
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Partial content 요청 처리
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'inline'
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // 일반 전체 파일 스트리밍
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'inline'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

router.post('/download', videoController.downloadVideo);

module.exports = router;
