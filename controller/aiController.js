const aiService = require('../service/aiService');

//gpt에게 이미지 전달 및, 저장은 서비스에서
exports.sendFinalToOpenAi = async(req, res) => {
    try {
        const testId = Number(req.body.testId);  // ✅ 숫자로 변환
        const type = req.body.type;

        const finalImageBuffer = req.files['finalImage'][0].buffer;
        const finalDrawingBuffer = req.files['finalDrawing'][0].buffer;

        const result = await aiService.sendFinalToOpenAi(finalImageBuffer, finalDrawingBuffer, type, testId);

        console.log({ "✅ ai response" : result });
        return res.status(200).json({ message: '✅ successfully saved events gpt analysis', result });
    } catch(error) {
        console.log({ "aiController sendFinalToOpenAi": error.message });
        return res.status(500).json({ message: '❌ controller sendFinalToOpenAi', error: error.message });
    }
};