const fs = require('fs');                   
const path = require('path');               
const AWS = require('aws-sdk');             
const s3 = new AWS.S3();                    

exports.downloadImage = async(req, res) => {
    const { testId, type } = req.query;
    
    if(process.env.NODE_ENV === 'production'){
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: `images/${testId}/${type}/`,
        };

        try {
            const listed = await s3.listObjectsV2(params).promise();
            if (!listed.Contents.length) return res.status(404).send('이미지가 없습니다.');
            const key = listed.Contents[0].Key;
            const imageData = await s3.getObject({ Bucket: params.Bucket, Key: key }).promise();

            res.set('Content-Type', imageData.ContentType || 'image/png');
            return res.send(imageData.Body);
        } catch (err) {
            return res.status(500).send('S3 이미지 불러오기 실패');
        }
    }else{
        const localPath = path.join(__dirname, '..', 'ai_uploads', testId, type, 'finalImg.png');
        if (!fs.existsSync(localPath)) return res.status(404).send('파일 없음');
        return res.sendFile(localPath);
    }
}