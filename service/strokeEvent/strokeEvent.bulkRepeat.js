const { findCenters, findClusters, findRepeatStrokes, convertToRepeatEvents } = require('./calculations/bulkRepeat');

exports.findBulkRepeatEvent = (finalDrawing) => {
    
    //각 stroke의 중심값을 찾음
    const strokes = finalDrawing.map(stroke => stroke.points);
    const centers = findCenters(strokes);
    
    //각 stroke의 중김값들 중 가까운 중심값들을 리스트로 묶어서 저장 
    //[[0, 4...], [...]]
    const epsilon = 20;
    const clusters = findClusters(centers, epsilon);

    //cluster의 유사도를 계산
    const hausdorff_epsilon = 10;
    const repeatStrokes = findRepeatStrokes(clusters, hausdorff_epsilon, finalDrawing);
    
    const repeatEvents = convertToRepeatEvents(repeatStrokes);
    return repeatEvents;
}


  