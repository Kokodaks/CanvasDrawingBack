
function generateSVGPaths(strokeData) {
    if (!strokeData?.strokes) return [];
  
    return strokeData.strokes.map(stroke => {
      const points = stroke.points;
      if (!points || points.length === 0) return '';
  
      const d = points.map((p, i) => {
        const cmd = i === 0 ? 'M' : 'L';
        return `${cmd} ${p.x} ${p.y}`;
      }).join(' ');
  
      return `<path d="${d}" stroke="${stroke.color}" stroke-width="${stroke.strokeWidth}" fill="none" />`;
    });
  }
  
  function wrapInSVG(paths, width = 800, height = 600) {
    return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${paths.join('\n  ')}
  </svg>
    `;
  }
  
  module.exports = { generateSVGPaths, wrapInSVG };
  