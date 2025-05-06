const DrawingStrokes = require('../database/mongodb/models/drawingStrokes');
const EventStrokes = require('../database/mongodb/models/eventStrokes');

exports.createDrawingStrokes = async(strokes) =>{
    console.log('저장 전 points', strokes[0].points);
    const newDrawingStrokes = await new DrawingStrokes({
        strokes: strokes
    }).save();

    return newDrawingStrokes;
}

exports.createEventStrokes = async() =>{

}