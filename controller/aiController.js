const aiService = require('../service/aiService');

//gpt에게 이미지 전달 및, 저장은 서비스에서
exports.sendFinalToOpenAi = async(req, res) =>{
    try{
        const testId = req.body.testId;
        const type = req.body.type;

        let finalImageBuffer = req.files['finalImage'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;

        //gpt 데이터 가지고 오기
        const result = await aiService.sendFinalToOpenAi(finalImageBuffer, finalDrawingBuffer, type, testId);

        console.log({ "✅ ai response" : result});
        return res.status(200).json({message: '✅ successfully saved events gpt analysis', result});
    }catch(error){
        console.log({"aiController sendFinalToOpenAi": error.message});
        return res.status(500).json({message : '❌ controller sendFinalToOpenAi', error: error.message});
    }
}



