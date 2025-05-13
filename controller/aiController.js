const aiService = require('../service/aiService');

exports.sendFinalToOpenAi = async(req, res) =>{
    try{
        const testid = req.body.testId;
        const childid = req.body.childId;

        let finalImageBuffer = req.files['finalImage'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());
        console.log({"parsed final drawing" : finalDrawing});
        
        await aiService.convertFinalToFile(finalImageBuffer, finalDrawing);
        await aiService.sendFinalToOpenAi();
        
        return res.status(200).json({message: '✅ successfully sent final drawing, final image to ai'});
    }catch(error){
        console.log({error: error.message});
        return status(500).json({message : '❌ controller sendFinalToOpenAi', error: error.message});
    }
}

// exports.sendToOpenAi = async(req, res) => {
//     try{
//         const testid = req.body.testId;
//         const childid = req.body.childId;
        
//         let duringImgBuffer = req.files['duringImage'][0].buffer;
//         let currentDrawingBuffer = req.files['currentDrawing'][0].buffer;
//         const currentDrawing = JSON.parse(currentDrawingBuffer.toString());
//         console.log({"parsed current drawing " : currentDrawing});

//         //OpenAi 전송용 파일 처리 및 전송
//         await aiService.convertToFile(duringImgBuffer, afterEraseImgBuffer, currentDrawing);
//         await aiService.sendToOpenAi();

//         return res.status(200).json({message: '✅ successfully sent capture, before/after images to ai'});
//     }catch(error){
//         console.log({error: error.message});
//         return res.status(500).json({message:'❌ controller sendToOpenAi', error: error.message});
//     }
// }

