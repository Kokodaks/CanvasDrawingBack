// controller/aiController.js
const aiService = require('../service/aiService');

exports.sendFinalToOpenAi = async (req, res) => {
  try {
    // 필요한 매개변수 확인
    const { testId, drawingType } = req.body;
    
    if (!testId || !drawingType) {
      return res.status(400).json({ 
        success: false, 
        message: '필수 필드가 누락되었습니다. testId와 drawingType이 필요합니다.' 
      });
    }
    
    // 파일 확인
    if (!req.files || !req.files.finalImage || !req.files.finalDrawing) {
      return res.status(400).json({ 
        success: false, 
        message: '필수 파일이 누락되었습니다. finalImage와 finalDrawing이 필요합니다.' 
      });
    }
    
    // 데이터 추출
    const finalImageBuffer = req.files.finalImage[0].buffer;
    const finalDrawingString = req.files.finalDrawing[0].buffer.toString('utf8');
    let finalDrawing;
    
    try {
      finalDrawing = JSON.parse(finalDrawingString);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'finalDrawing JSON 파싱에 실패했습니다.' 
      });
    }
    
    // 서비스 호출
    const result = await aiService.processFinalDrawing(
      testId, 
      finalImageBuffer, 
      finalDrawing, 
      drawingType
    );
    
    // 결과 반환
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('AI 처리 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: `AI 처리 중 오류가 발생했습니다: ${error.message}` 
    });
  }
};