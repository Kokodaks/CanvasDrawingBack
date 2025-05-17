const emrDraftService = require('../service/emrDraftService');

/**
 * AI 분석 내용을 기존 HTP 보고서에 자동 기입하는 컨트롤러
 */
exports.autoFillReportWithAiAnalysis = async (req, res) => {
  try {
    const { testId, types } = req.body;
    
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: 'testId는 필수 입력값입니다.' 
      });
    }
    
    const parsedTestId = Number(testId);
    
    const results = await emrDraftService.autoFillReportWithAiAnalysis(parsedTestId, types);
    
    return res.status(200).json({ 
      success: true, 
      message: 'AI 분석 내용 자동 기입 완료', 
      data: results 
    });
  } catch (error) {
    console.error('emrDraftController autoFillReportWithAiAnalysis 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'AI 분석 내용 자동 기입 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
};