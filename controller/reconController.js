const reconService = require('../service/reconService');

exports.createStrokeData = async(req, res) =>{
    try{
        const testId = req.body.testId;
        const type = req.body.type;

        let drawingBuffer = req.files['drawing'][0].buffer;
        let finalDrawingBuffer = req.files['finalDrawing'][0].buffer;
        
        const drawing = JSON.parse(drawingBuffer.toString());
        const finalDrawing = JSON.parse(finalDrawingBuffer.toString());

        if(drawing === null || finalDrawing === null){
            return res.status(404).json({message : '❌ Incomplete drawing'});            
        }

        //null로 만들어서 garbage collector가 회수
        drawingBuffer = null;
        finalDrawingBuffer = null;
        
        const drawingStrokes = await reconService.createDrawingStrokes(testId, type, drawing);
        const finalStrokes = await reconService.createFinalStrokes(testId, type, finalDrawing);
        const events = await reconService.createStrokeEvents(testId, type, finalDrawing);

        console.log({'drawing saved' : drawingStrokes.strokes.length, 'final drawing saved' : finalStrokes, "events saved" : events});

        return res.status(200).json({message: '✅ successfully created stroke data', 
            drawingStrokes : drawingStrokes, finalStrokes : finalStrokes, drawingEvents : drawingEvents});
    }catch(error){
        return res.status(500).json({message:'❌ controller createStrokeData', error: error.message});
    }
}

exports.getEventsAndStrokes = async(req, res) => {
    try{
        const { testId, type } = req.body;
        const {finalStrokes, allStrokes, events} = await reconService.getEventsAndStrokes(testId, type);

        return res.status(200).json({message: '✅ successfully found stroke data', 
            finalStrokes : finalStrokes, allStrokes : allStrokes, events : events});
    }catch(error){
        return res.status(500).json({message:'❌ controller findStrokeData', error: error.message});
    }
}



// exports.getSvgData = async(req, res) => {
//     try{
        
//     }catch(error){

//     }
// }

