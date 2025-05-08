const DrawingStrokes = require('../database/mongodb/models/drawingStrokes');
const EventStrokes = require('../database/mongodb/models/eventStrokes');

exports.createDrawingStrokes = async(drawing) =>{
    const newDrawingStrokes = await new DrawingStrokes({
        strokes: drawing
    }).save();

    return newDrawingStrokes;
}

exports.createEventStrokes = async(DrawingStrokesId) =>{
    const newEventStrokes = await new EventStrokes({
        drawing : DrawingStrokesId
    }).save();

    return newEventStrokes;
}

exports.findEventStrokes = async(DrawingStrokesId) => {
    try{    
        const eventStrokes = await EventStrokes.findOne({
            drawing: DrawingStrokesId
        });

        return eventStrokes;
    }catch(error){
        console.error('reconRepo error: ', error);
        throw error;
    }
}