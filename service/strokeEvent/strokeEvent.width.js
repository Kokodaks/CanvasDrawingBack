exports.findWidthEvent = (finalDrawing, DrawingStrokesId) => {
    const widths = finalDrawing.map(stroke => stroke.strokeWidth);

    const avgWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;
    const epsilon = 0.1 * avgWidth;

    const thickStrokes = finalDrawing.filter(stroke => stroke.strokeWidth > avgWidth + epsilon);
    const thinStrokes = finalDrawing.filter(stroke => stroke.strokeWidth < avgWidth - epsilon);
    
    const thickEvents = convertToThickEvent(thickStrokes, DrawingStrokesId);
    const thinEvents = convertToThinEvent(thinStrokes, DrawingStrokesId);

    return {thickEvents, thinEvents};
}

const convertToThinEvent = (thinStrokes, DrawingStrokesId) =>{
    return thinStrokes.map(stroke => ({
        drawing : DrawingStrokesId,
        strokeOrder : stroke.strokeOrder,
        event: ["thin"]
    }));
}

const convertToThickEvent = (thickStrokes, DrawingStrokesId) => {
    return thickStrokes.map(stroke => ({
        drawing : DrawingStrokesId,
        strokeOrder : stroke.strokeOrder,
        event: ["thick"]
    }));
}