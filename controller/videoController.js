const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.downloadVideo = async (req, res) => {
  const { url: videoUrl, id, name } = req.body;

  if (!videoUrl || !id || !name) {
    return res.status(400).json({ error: 'url, id, name 모두 필요합니다.' });
  }

  const fileName = `${id}_${name}.mp4`;
  const savePath = path.join(__dirname, '..', 'downloads', fileName);

  try {
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      return res.json({ message: '동영상 저장 완료', path: savePath });
    });

    writer.on('error', (err) => {
      return res.status(500).json({ error: '파일 저장 중 오류', detail: err.message });
    });
  } catch (error) {
    return res.status(500).json({ error: '동영상 다운로드 실패', detail: error.message });
  }
};
