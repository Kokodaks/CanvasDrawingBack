const aiService = require('../service/aiService');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3();

//gpt에게 이미지 전달 및, 저장은 서비스에서
exports.sendFinalToOpenAi = async(req, res) => {
    try {
        const testId = Number(req.body.testId);  // ✅ 숫자로 변환
        const type = req.body.type;

        const finalImageBuffer = req.files['finalImage'][0].buffer;
        const finalDrawingBuffer = req.files['finalDrawing'][0].buffer;

        //s3 버킷 저장 
        if(process.env.NODE_ENV === 'production'){
            const file = req.files['finalImage'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `images/${testId}/${type}/${Date.now()}_${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };
            
            const result = await s3.upload(params).promise();
            console.log('✅ 최종 이미지 S3 저장 완료:', result.Location);
        }

        const result = await aiService.sendFinalToOpenAi(finalImageBuffer, finalDrawingBuffer, type, testId);

        console.log({ "✅ ai response" : result });
        return res.status(200).json({ message: '✅ successfully saved events gpt analysis', result });
    } catch(error) {
        console.log({ "aiController sendFinalToOpenAi": error.message });
        return res.status(500).json({ message: '❌ controller sendFinalToOpenAi', error: error.message });
    }
};