const reconRepo = require('../repo/reconRepo');
const speed = require('./strokeEvent/strokeEvent.speed');
const width = require('./strokeEvent/strokeEvent.width');
const bulk_repeat = require('./strokeEvent/strokeEvent.bulkRepeat');

exports.createDrawingStrokes = async(testId, type, drawing) =>{
    try{

        const drawingStrokes = await reconRepo.createDrawingStrokes(testId, type, drawing);
        return {drawingStrokes};

    }catch(error){
        console.log({"reconService createDrawingStrokes" : error.message});
    }
}

exports.createFinalStrokes= async(testId, type, finalDrawing) =>{
    try{
        const finalStrokes = await reconRepo.createFinalStrokes(testId, type, finalDrawing);

        return {finalStrokes};
    }catch(error){
        console.log({"reconService createFinalStrokes" : error.message});
    }
}


exports.createStrokeEvents = async(testId, type, finalDrawing) => {
    try{
        const {slowEvents, fastEvents, thinEvents, thickEvents, repeatEvents} = identifyStrokeEvent(finalDrawing);
        const allEvents = [...slowEvents, ...fastEvents, ...thinEvents, ...thickEvents, ...repeatEvents];
        console.log("reconService createStrokeEvents allEvents :", allEvents);
        const noDuplicates = removeDuplicates(allEvents);

        console.log('reconService createStrokeEvents 🧪 저장 전 이벤트:', JSON.stringify(noDuplicates, null, 2));

        const drawingEvents = await reconRepo.createStrokeEvents(testId, type, noDuplicates);



        return { drawingEvents };
    }catch(error){
        console.log({"reconService createStrokeEvents" : error.message});
    }
    
}

exports.getEventsAndStrokes=async(testId, type)=> {
    try{
        const finalStrokes = await reconRepo.getFinalStrokes(testId, type);
        const allStrokes = await reconRepo.getAllStrokes(testId, type);
        const events = await reconRepo.getEvents(testId, type);

        return {finalStrokes, allStrokes, events};
    }catch(error){
        console.log({"reconService findFinalStrokes" : error.message});
    };
}

// reconService 단에서만 작동하는 함수
function removeDuplicates (allEvents){
    const merged = [];
    for(const {strokeOrder, event} of allEvents){
        const existing = merged.find(e => e.strokeOrder === strokeOrder);
        if(existing){
            existing.event.push(...event);
        }else{
            merged.push({strokeOrder, event:[...event]});
        }
    }

    return merged;
}

function identifyStrokeEvent (finalDrawing) {
    // 평균보다 느리게 그려졌거나 머문 stroke, 빠르게 그려진 stroke
    const {slowEvents, fastEvents} = speed.findSpeedEvent(finalDrawing);
    console.log({"느린 이벤트" : slowEvents, "빠른 이벤트" : fastEvents});
    
    // 평균보다 굵거나 얇은 선
    const {thinEvents, thickEvents} = width.findWidthEvent(finalDrawing);
    console.log({"얇은 선" :  thinEvents, "굵은 선" : thickEvents});
    
    // 반복적으로 같은 위치에서 그림
    const { repeatEvents } = bulk_repeat.findBulkRepeatEvent(finalDrawing);
    console.log({"반복 선" : repeatEvents});
    
    return({slowEvents, fastEvents, thinEvents, thickEvents, repeatEvents});
}
