const videoService = require('../service/videoService');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3();

exports.uploadVideo = async (req, res) => {
  console.log('📥 /video/upload 요청 도착!');
  const { testId, type } = req.body;
  const file = req.file;

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
      const savedPath = await videoService.saveVideo({ testId, type, file });
      res.json({
        message: '업로드 성공',
        savedPath
      });

    }
  } catch (err) {
    console.error('❌ 저장 실패:', err);
    res.status(500).json({ error: '서버 에러', detail: err.message });
  }
};

//웹 --> s3 버킷 요청 api
exports.downloadVideo = async(req, res) => {
  const {testId, type} = req.body;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: `videos/${testId}/${type}/`
  }

  //Prefix 경로에 있는 파일 하나를 가져옴 (애초에 testId/type 내부에 하나만 저장될 예정)
  try{
    const list = await s3.listObjectsV2(params).promise();

    if(!list.Contents || list.Contents.length === 0){
      return res.status(404).json({error : '영상이 없습니다.'});
    }

    const key = list.Contents[0].Key;

    const data = await s3.getObject({
      Bucket: process.env.S3.BUCKET_NAME,
      Key: key
    }).promise();
    
    res.set('Content-Type', data.ContentType || 'video/mp4');
    res.send(data.body);

  }catch(err){
    console.error('❌ 다운로드 실패:', err);
  }
  
}