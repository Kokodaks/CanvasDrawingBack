const reconService = require('../service/reconService');

exports.createStrokeData = async(req, res) =>{
    try{
        const drawingBuffer = req.files['drawing'][0].buffer;
        const finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        
        const drawing = JSON.parse(drawingBuffer.toString());
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());

        console.log({'drawing': drawing});
        console.log({'finalDrawing' : finalDrawing});
        
        // const strokeData = await reconService.createStrokeData(drawing, finalDrawing);

        return res.status(200).json({message: '✅ successfully created stroke data'});
    }catch(error){
        console.log("저장 실패!! : ", error.message);
        return res.status(500).json({message:'❌ error createing stroke data', error: error.message});
    }
}

// exports.getJsonData = async(req, res) =>{
//     try{
        
//     }catch(error){

//     }
// }

// exports.getSvgData = async(req, res) => {
//     try{
        
//     }catch(error){

//     }
// }

