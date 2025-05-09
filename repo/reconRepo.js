const DrawingStrokes = require('../database/mongodb/models/drawingStrokes');
const EventStrokes = require('../database/mongodb/models/eventStrokes');
const FinalStrokes = require('../database/mongodb/models/finalStrokes');

exports.createDrawingStrokes = async(drawing) =>{
    const newDrawingStrokes = await new DrawingStrokes({
        strokes: drawing
    }).save();

    return newDrawingStrokes;
}

exports.createFinalStrokes = async(drawingid, finalDrawing) =>{
    const newFinalStrokes = await new FinalStrokes({
        drawing: drawingid,
        strokes : finalDrawing
    }).save();

    return newFinalStrokes;
}

exports.createStrokeEvents = async(drawingid, drawingEvents) =>{
    const newEventStrokes = await new EventStrokes({
        drawing : drawingid,
        eventStrokes : drawingEvents
    }).save();

    return newEventStrokes;
}

exports.findFinalStrokeData = async(objectid) =>{
    const finalStrokes = await FinalStrokes.findOne({drawing: objectid});
    return finalStrokes;
}