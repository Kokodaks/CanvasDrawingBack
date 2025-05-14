const aiService = require('../service/aiService');
const gptAnalysisService = require('../service/gptAnalysisService');

exports.sendFinalToOpenAi = async(req, res) =>{
    try{
        const testId = req.body.testId;
        const type = req.body.type;

        let finalImageBuffer = req.files['finalImage'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());
        console.log({"open ai final drawing" : finalDrawing});

        //gpt 데이터 가지고 오기
        const events = await aiService.sendFinalToOpenAi(finalImageBuffer, finalDrawing);
        //gpt 데이터 저장하기
        const gptAnalysis = await gptAnalysisService.saveGptAnalysis(testId, type, events);

        console.log({ "✅ ai response" : events});
        return res.status(200).json({message: '✅ successfully saved events gpt analysis', saved : gptAnalysis});
    }catch(error){
        console.log({"aiController sendFinalToOpenAi": error.message});
        return res.status(500).json({message : '❌ controller sendFinalToOpenAi', error: error.message});
    }
}



