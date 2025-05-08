const reconRepo = require('../repo/reconRepo');
const speed = require('./strokeEvent/strokeEvent.speed');
const width = require('./strokeEvent/strokeEvent.width');
const bulk_repeat = require('./strokeEvent/strokeEvent.bulkRepeat');
const erase_repeat = require('./strokeEvent/strokeEvent.eraseRepeat');

exports.createStrokeData = async(drawing, finalDrawing) =>{
    try{

        const DrawingStrokes = await reconRepo.createDrawingStrokes(drawing);
        const DrawingStrokesId = DrawingStrokes._id;
    
        // 평균보다 느리게 그려졌거나 머문 stroke, 빠르게 그려진 stroke
        const {slowEvents, fastEvents} = speed.findSpeedEvent(finalDrawing);
        console.log({"느린 이벤트" : slowEvents, "빠른 이벤트" : fastEvents});

        // 평균보다 굵거나 얇은 선
        const {thinEvents, thickEvents} = width.findWidthEvent(finalDrawing);
        console.log({"얇은 선" :  thinEvents, "굵은 선" : thickEvents});
        
        // 반복적으로 같은 위치에서 그림
        const { repeatEvents } = bulk_repeat.findBulkRepeatEvent(finalDrawing);
        console.log({"반복 선" : repeatEvents});
    
        return DrawingStrokes;
    }catch(error){
        console.log({reconService : error.message});
    }

}

