const fs = require('fs');
const path = require('path');

exports.moveVideo = ({ id, name, file }) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const finalPath = path.join(__dirname, '..', 'downloads', id, file.originalname);

    // 이미 원하는 위치에 저장되었으므로 이름 바꾸지 않음
    // 필요 시 이름 변경 가능:
    // const newPath = path.join(__dirname, '..', 'downloads', id, `${name}_${Date.now()}${ext}`);
    // fs.rename(file.path, newPath, ...)

    // 실제 이동 없이 경로 리턴 (이미 위치 OK)
    resolve(finalPath);
  });
};
