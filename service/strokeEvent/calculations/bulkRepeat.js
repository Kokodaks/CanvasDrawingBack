//중심값 찾기
function findCenters(strokes){    
    const sumPerStroke = strokes.map(points => points.reduce(
        (sum, point) => {
            return{x: sum.x + point.x, y: sum.y + point.y};
        },
        //누적 계산하기 전, x하고 y의 초기값
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

//중심값이 가까운 stroke들을 cluster로 묶기
function findClusters (centers, epsilon){
    const groups = [];
  
    for (let i = 0; i < centers.length; i++) {
      const current = centers[i];
      let foundGroup = false;
        
      for (const group of groups) {
        const representative = centers[group[0]];  // 그룹의 대표 중심
        const dx = current.x - representative.x;
        const dy = current.y - representative.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < epsilon) {
          group.push(i); 
          foundGroup = true;
          break;
        }
      }
      
      if (!foundGroup) {
        groups.push([i]);  
      }
    }
  
    return groups; // [[0,3,5], [1,2], ...]
};

//cluster로 묶인 stroke들의 유사도를 hausdorff 방식으로 게산
function findRepeatStrokes(clusters, hausdorff_epsilon, finalDrawing){
  const repeatGroups = [];

  for (const cluster of clusters) {
    if (cluster.length < 2) continue;

    const validIndices = [];

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const strokeA = finalDrawing[cluster[i]];
        const strokeB = finalDrawing[cluster[j]];

        const ptsA = strokeA.points.map(p => ({ x: p.x, y: p.y }));
        const ptsB = strokeB.points.map(p => ({ x: p.x, y: p.y }));

        const distance = findHausdorffDistance(ptsA, ptsB);

        console.log(`🧪 ${cluster[i]} ↔ ${cluster[j]} 거리:`, distance);

        if (distance < hausdorff_epsilon) {
          if (!validIndices.includes(cluster[i])) validIndices.push(cluster[i]);
          if (!validIndices.includes(cluster[j])) validIndices.push(cluster[j]);
        }
      }
    }

    if (validIndices.length > 0) {
      repeatGroups.push(validIndices);
    }
  }

  return repeatGroups;
}

//Modified Hausdorff Distance 계산 : 
    //두 stroke의 point를 비교해서 각 setA의 point마다 가까운 위치에 있는 setB point를 찾음
    //setA -> setB, setA <- setB 평균 오차 거리 계산
    //두 개의 평균 오차 중, 최고 값 반환 
function findHausdorffDistance(setA, setB) {
    return Math.max(
        modifiedHausdorff(setA, setB),
        modifiedHausdorff(setB, setA)
    );
}

function modifiedHausdorff(fromSet, toSet) {
    const distances = fromSet.map(p1 =>
        Math.min(...toSet.map(p2 => euclideanDistance(p1, p2)))
    );
    return distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
}

function euclideanDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function convertToRepeatEvents(repeatStrokes){
  return repeatStrokes.map(repeatStroke => ({
    strokeOrder : repeatStroke,
    event : "repeat"
  }));
}

module.exports = {
  findCenters,
  findClusters,
  findRepeatStrokes,
  convertToRepeatEvents
};

