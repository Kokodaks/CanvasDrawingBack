exports.findWidthEvent = (finalDrawing, DrawingStrokesId) => {
    const widths = finalDrawing.flatMap(stroke => stroke.points.map(point => point.p));

    const avgWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;
    const epsilon = 0.1 * avgWidth;

    const thickStrokes = finalDrawing.filter(stroke => {
        const pressures = stroke.points.map(p => p.p);
        const avgP = pressures.reduce((sum, p) => sum + p, 0) / pressures.length;
        return avgP > avgWidth + epsilon;
    });

    const thinStrokes = finalDrawing.filter(stroke => {
        const pressures = stroke.points.map(p => p.p);
        const avgP = pressures.reduce((sum, p) => sum + p, 0) / pressures.length;
        return avgP < avgWidth + epsilon;
    });
    
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