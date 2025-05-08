exports.findSpeedEvent = (finalDrawing) => {
  //stroke별 속도 계산
  const strokesWithSpeed = finalDrawing.map(stroke => ({
    stroke,
    speed: calculateStrokeSpeed(stroke)
  }));

  //평균과 평균에서 떨어진 기준값 계산
  const avgSpeed = strokesWithSpeed.reduce((sum, s) => sum + s.speed, 0) / strokesWithSpeed.length;
  const epsilon = 0.3 * avgSpeed;

  //느린 stroke, 빠른 stroke 추출
  const slowStrokes = findSlowStrokes(strokesWithSpeed, avgSpeed, epsilon);
  const fastStrokes = findFastStrokes(strokesWithSpeed, avgSpeed, epsilon);

  //느린 이벤트 json, 빠른 이벤트 json 생성
  const slowEvents = convertToSlowEvent(slowStrokes);
  const fastEvents = convertToFastEvent(fastStrokes);

  return {slowEvents, fastEvents};
}

//stroke의 길이와 그려진 시간에 따른 속도 계산
const calculateStrokeSpeed = (stroke) => {
    const points = stroke.points;

    if (points.length < 2) return Infinity; 
  
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
  
    const time = points.map(p => p.t);
    const duration = Math.max(...time) - Math.min(...time);
  
    return duration > 0 ? totalDistance / duration : Infinity;
};

// 평균 속도 - 0.05 보다도 느린 stroke 추출
const findSlowStrokes = (strokesWithSpeed, avgSpeed, epsilon) => {

    const slowStrokes = strokesWithSpeed
      .filter(s => s.speed < avgSpeed-epsilon)
      .map(s => s.stroke);
  
    return slowStrokes;
};

//평균 속도 + 0.05 보다도 빠른 stroke 추출
const findFastStrokes = (strokesWithSpeed, avgSpeed, epsilon) =>{

  const fastStrokes = strokesWithSpeed
    .filter(s => s.speed > avgSpeed + epsilon)
    .map(s => s.stroke);

  return fastStrokes;
}

const convertToSlowEvent = (slowStrokes) => {
  return slowStrokes.map(stroke => ({
    strokeOrder : stroke.strokeOrder,
    event: ["slow"]
  }));
}

const convertToFastEvent = (fastStrokes) =>{
  return fastStrokes.map(stroke => ({
    strokeOrder: stroke.strokeOrder,
    event: ["fast"]
  }));
}
  
