const videoService = require('../service/videoService');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3();

exports.uploadVideo = async (req, res) => {
  console.log('📥 /video/upload 요청 도착!');
  const { testId, type } = req.body;
  const file = req.file;

  console.log('🔥 video req.body:', req.body);
  console.log('🔥 video req.file:', file);

  if (!testId || !type || !file) {
    return res.status(400).json({ error: 'testId, type, video 파일이 필요합니다.' });
  }

  try {
    //서버 s3
    if(process.env.NODE_ENV === 'production'){
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `videos/${testId}/${type}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata:{
          testId: testId,
          type: type,
        }
      };
      const s3Upload = await s3.upload(params).promise();
      console.log('✅ 업로드 성공:', s3Upload.Location);
      res.json({
        message: '업로드 성공',
        s3Upload
      })

    }else{
      //테스트 환경
      // const savedPath = await videoService.saveVideo({ testId, type, file });
      // res.json({
      //   message: '업로드 성공',
      //   savedPath
      // });

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `videos/${testId}/${type}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          testId,
          type
      }
    };

    const s3Upload = await s3.upload(params).promise();
    console.log('✅ S3 업로드 완료:', s3Upload.Location);
    res.json({ message: '업로드 성공', s3Upload });

    }
  } catch (err) {
    console.error('❌ 저장 실패:', err);
    res.status(500).json({ error: '서버 에러', detail: err.message });
  }
};

//웹 --> s3 버킷 요청 api
exports.downloadVideo = async (req, res) => {
  const { testId, type } = req.query;
  const range = req.headers.range;

  if (!range) {
    return res.status(400).send('❌ Range 헤더가 필요합니다.');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: `videos/${testId}/${type}/`,
  };

  try {
    const list = await s3.listObjectsV2(params).promise();

    if (!list.Contents || list.Contents.length === 0) {
      return res.status(404).json({ error: '영상이 없습니다.' });
    }

    const key = list.Contents[0].Key;

    const head = await s3.headObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }).promise();

    const videoSize = head.ContentLength;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
    const chunkSize = end - start + 1;

    const stream = s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Range: `bytes=${start}-${end}`,
    }).createReadStream();

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline"
    });

    stream.pipe(res);
  } catch (err) {
    console.error('❌ 스트리밍 실패:', err);
    res.status(500).send('서버 오류로 영상을 불러올 수 없습니다.');
  }
};