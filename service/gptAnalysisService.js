const gptAnalysisRepo = require('../repo/gptAnalysisRepo');

exports.saveGptAnalysis = async (data) => {
  return await gptAnalysisRepo.saveGptAnalysis(data);
};

exports.getGptAnalyses = async (testId, type) => {
  return await gptAnalysisRepo.getGptAnalysesByTestIdAndType(testId, type);
};
