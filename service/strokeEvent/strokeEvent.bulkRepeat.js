exports.findBulkRepeatEvent = (finalDrawing, DrawingStrokesId) => {
    
    const centers = findCenter(finalDrawing);
    
    //가까운 기준
    const epsilon = 20;
    const findClusters = (centers, epsilon);
    

}

//stroke 별 중심 계산
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

//가까운 위치의 중심 찾기
const findClusters = (centers, epsilon) => {
    const groups = [];
  
    for (let i = 0; i < centers.length; i++) {
      const current = centers[i];
      //groups 내 리스트들 중 비슷한 위치인 groups를 찾으면 true
      let foundGroup = false;
        
      //모든 좌표는 결국 groups에 저장. 그래서, groups[0]의 중심을 기준으로 거리 계산 후 비교
      for (const group of groups) {
        const representative = group[0];  // 그룹의 대표 중심
        const dx = current.x - representative.x;
        const dy = current.y - representative.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // stroke index만 저장
        if (distance < epsilon) {
          group.push(i); 
          foundGroup = true;
          break;
        }
      }
      
      // 새로운 그룹 생성 및 해당 stroke index 저장
      if (!foundGroup) {
        groups.push([i]);  
      }
    }
  
    return groups; // [[0,3,5], [1,2], ...]
  };
  