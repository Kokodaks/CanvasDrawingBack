const gptAnalysisRepo = require('../repo/gptAnalysisRepo');

exports.saveGptAnalysis = async (testId, type, data) => {
  return await gptAnalysisRepo.saveGptAnalysis(testId, type, data);
};

exports.getGptAnalyses = async (testId, type) => {
  return await gptAnalysisRepo.getGptAnalysesByTestIdAndType(testId, type);
};
