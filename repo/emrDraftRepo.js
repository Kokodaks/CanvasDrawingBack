const HTPReport = require('../database/mongodb/models/htpReport');
const GptAnalysis = require('../database/mongodb/models/gptAnalysis');
const Note = require('../database/mongodb/models/note');

/**
 * 특정 테스트 ID와 타입에 해당하는 GPT 분석 데이터 조회
 */
exports.findGptAnalysisByTestIdAndType = async (testId, type) => {
  return await GptAnalysis.findOne({ testId, type });
};

/**
 * 특정 테스트 ID와 타입에 해당하는 노트 데이터 조회
 */
exports.findNotesByTestIdAndType = async (testId, type) => {
  return await Note.findOne({ testId, type });
};

/**
 * 기존 HTP 보고서에 AI 분석 데이터 업데이트
 */
exports.updateReportWithAiAnalysis = async (testId, data) => {
  return await HTPReport.findOneAndUpdate({ testId }, data, { new: true });
};

/**
 * HTP 보고서 존재 여부 확인
 */
exports.existsByTestId = async (testId) => {
  return await HTPReport.exists({ testId });
};