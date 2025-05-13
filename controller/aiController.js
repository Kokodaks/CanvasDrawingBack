const aiService = require('../service/aiService');
const gptAnalysisService = require('../service/gptAnalysisService');

exports.sendFinalToOpenAi = async(req, res) =>{
    try{
        const testid = req.body.testId;
        const type = req.body.type;

        let finalImageBuffer = req.files['finalImage'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());
        console.log({"parsed final drawing" : finalDrawing});

        //gpt 데이터 가지고 오기
        const data = await aiService.sendFinalToOpenAi(finalImageBuffer, finalDrawing);
        //gpt 데이터 저장하기
        const result = await gptAnalysisService.saveGptAnalysis(data, testid, type);

        console.log({ "✅ successfully sent final drawing, final image to ai" : result});
        return res.status(200).json({message: '✅ successfully sent final drawing, final image to ai', analysis : result});
    }catch(error){
        console.log({error: error.message});
        return status(500).json({message : '❌ controller sendFinalToOpenAi', error: error.message});
    }
}



