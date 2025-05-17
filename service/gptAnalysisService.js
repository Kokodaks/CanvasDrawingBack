const GptAnalysis = require('../database/mongodb/models/gptAnalysis');

/**
 * GPT 분석 결과를 데이터베이스에 저장
 * @param {Number} testId - 테스트 ID
 * @param {String} type - 그림 유형 (house, tree, man, woman)
 * @param {Array} events - 이벤트 배열
 * @returns {Promise<Object>} 저장된 GptAnalysis 객체
 */
exports.saveGptAnalysis = async (testId, type, events) => {
  try {
    // 기존 데이터가 있는지 확인
    let gptAnalysis = await GptAnalysis.findOne({ testId, type });
    
    if (gptAnalysis) {
      // 기존 데이터 업데이트
      gptAnalysis.events = events;
      return await gptAnalysis.save();
    } else {
      // 새 데이터 생성
      gptAnalysis = new GptAnalysis({
        testId,
        type,
        events
      });
      return await gptAnalysis.save();
    }
  } catch (error) {
    console.error("GPT 분석 저장 오류:", error);
    throw new Error(`GPT 분석 저장 실패: ${error.message}`);
  }
};

/**
 * 특정 테스트 ID와 타입의 GPT 분석 결과 조회
 * @param {Number} testId - 테스트 ID
 * @param {String} type - 그림 유형
 * @returns {Promise<Object|null>} 조회된 GptAnalysis 객체 또는 null
 */
exports.getGptAnalysis = async (testId, type) => {
  try {
    return await GptAnalysis.findOne({ testId, type });
  } catch (error) {
    console.error("GPT 분석 조회 오류:", error);
    throw new Error(`GPT 분석 조회 실패: ${error.message}`);
  }
};

/**
 * 특정 테스트 ID의 모든 GPT 분석 결과 조회
 * @param {Number} testId - 테스트 ID
 * @returns {Promise<Array>} 조회된 GptAnalysis 객체 배열
 */
exports.getAllGptAnalysisByTestId = async (testId) => {
  try {
    return await GptAnalysis.find({ testId });
  } catch (error) {
    console.error("GPT 분석 목록 조회 오류:", error);
    throw new Error(`GPT 분석 목록 조회 실패: ${error.message}`);
  }
};