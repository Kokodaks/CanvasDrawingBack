const reconRepo = require('../repo/reconRepo');
const speed = require('./strokeEvent/strokeEvent.speed');
const width = require('./strokeEvent/strokeEvent.width');
const repeat = require('./strokeEvent/strokeEvent.repeat');
const erase = require('./strokeEvent/strokeEvent.erase');

exports.createStrokeData = async(drawing, finalDrawing) =>{
    try{

        const DrawingStrokes = await reconRepo.createDrawingStrokes(drawing);
        const DrawingStrokesId = DrawingStrokes._id;
    
        // 평균보다 느리게 그려졌거나 머문 stroke, 빠르게 그려진 stroke
        const {slowEvents, fastEvents} = speed.findSpeedEvent(finalDrawing, DrawingStrokesId);
        console.log({"느린 이벤트" : slowEvents, "빠른 이벤트" : fastEvents});

        // 선 굵기 변화
        const {thinEvents, thickEvents} = width.findWidthEvent(finalDrawing, DrawingStrokesId);
        console.log({"얇은 선" :  thinEvents, "굵은 선" : thickEvents});
        
        // 지우고 다시 그림
        
        // 반복 그림
        
    
        return DrawingStrokes;
    }catch(error){
        console.log({reconService : error.message});
    }

}

