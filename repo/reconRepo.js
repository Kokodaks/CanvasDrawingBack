const DrawingStrokes = require('../database/mongodb/models/drawingStrokes');
const EventStrokes = require('../database/mongodb/models/eventStrokes');
const FinalStrokes = require('../database/mongodb/models/finalStrokes');

exports.createDrawingStrokes = async(testId, type, drawing) =>{
    const newDrawingStrokes = await new DrawingStrokes({
        testId : testId,
        type : type,
        strokes: drawing
    }).save();

    return newDrawingStrokes;
}

exports.createFinalStrokes = async(testId, type, finalDrawing) =>{
    const newFinalStrokes = await new FinalStrokes({
        testId: testId,
        type: type,
        strokes : finalDrawing
    }).save();

    return newFinalStrokes;
}

exports.createStrokeEvents = async(testId, type, drawingEvents) =>{
    const newEventStrokes = await new EventStrokes({
        testId : testId,
        type: type,
        eventStrokes : drawingEvents
    }).save();

    return newEventStrokes;
}

exports.getFinalStrokes = async(testId, type) =>{
    const finalStrokes = await FinalStrokes.findOne({testId, type});
    return finalStrokes;
}

exports.getAllStrokes = async(testId, type) =>{
    const allStrokes = await DrawingStrokes.findOne({testId, type});
    return allStrokes;
}

exports.getEvents = async(testId, type) => {
    const events = await EventStrokes.findOne({testId, type});
    return events;
}
