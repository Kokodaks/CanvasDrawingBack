const fs = require('fs');
const path = require('path');

exports.moveVideo = ({ testId, type, file }) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const timestamp = Date.now();
    const finalFileName = `${timestamp}${ext}`; // 이름 중복 방지용 timestamp 사용

    // ✅ 저장 경로: downloads/{testId}/{type}/video/
    const folderPath = path.join(__dirname, '..', 'downloads', String(testId), type, 'video');

    // ✅ 1. 폴더 없으면 생성
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // ✅ 2. 최종 경로
    const finalPath = path.join(folderPath, finalFileName);

    // ✅ 3. 파일 이동
    fs.rename(file.path, finalPath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(finalPath);
    });
  });
};
