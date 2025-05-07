exports.findBulkRepeatEvent = (finalDrawing, DrawingStrokesId) => {
    const centers = findCenter(finalDrawing);
    
}

//stroke 별 중심 위치 계산
const findCenter = (finalDrawing) =>{
    const strokes = finalDrawing.map(stroke => stroke.points);
    
    const sumPerStroke = strokes.map(points => points.reduce(
        (sum, point) => {
            return{x: sum.x + point.x, y: sum.y + point.y};
        },
        {x:0, y:0}
    ));

    const centerPerStroke = sumPerStroke.map((sum, index) => {
        const count = strokes[index].length;
        return{
            x: sum.x / count,
            y: sum.y / count
        }
    });

    return centerPerStroke;
};