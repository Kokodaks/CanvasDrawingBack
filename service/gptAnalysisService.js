const gptAnalysisRepo = require('../repo/gptAnalysisRepo');

exports.saveGptAnalysis = async (testId, type, events) => {
  return await gptAnalysisRepo.saveGptAnalysis(testId, type, events);
};

exports.getGptAnalyses = async (testId, type) => {
  return await gptAnalysisRepo.getGptAnalysesByTestIdAndType(testId, type);
};
