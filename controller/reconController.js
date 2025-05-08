const reconService = require('../service/reconService');

exports.createStrokeData = async(req, res) =>{
    try{
        let drawingBuffer = req.files['drawing'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        
        const drawing = JSON.parse(drawingBuffer.toString());
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());

        // if(drawing === null || finalDrawing === null){

        // }


        drawingBuffer = null;
        finalDrawingBuffer = null;

        console.log({'drawing': drawing});
        console.log({'finalDrawing' : finalDrawing});
        
        const { drawingStrokes, drawingid } = await reconService.createDrawingStrokes(drawing);
        const finalStrokes = await reconService.createFinalStrokes(drawingid, finalDrawing);
        const drawingEvents = await reconService.createStrokeEvents(drawingid, finalDrawing);

        console.log({'drawing saved' : drawingStrokes});
        console.log({'final drawing saved' : finalStrokes});
        console.log({'drawing events saved' : drawingEvents });

        return res.status(200).json({message: '✅ successfully created stroke data'});
    }catch(error){
        console.log("저장 실패!! : ", error.message);
        return res.status(500).json({message:'❌ controller createStrokeData', error: error.message});
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

