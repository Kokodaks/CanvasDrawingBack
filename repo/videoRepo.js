const fs = require('fs');
const path = require('path');

exports.moveVideo = ({ testId, name, file }) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const folderPath = path.join(__dirname, '..', 'downloads', String(testId));

    // ✅ 1. 폴더 없으면 생성
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // ✅ 2. 최종 저장 경로 구성 (이름 중복 방지용 name + timestamp 추천)
    const timestamp = Date.now();
    const finalFileName = `${name}${ext}`;
    const finalPath = path.join(folderPath, finalFileName);

    // ✅ 3. 파일 이동 (temp → downloads/{testId}/)
    fs.rename(file.path, finalPath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(finalPath);
    });
  });
};
