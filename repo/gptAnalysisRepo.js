const GptAnalysis = require('../database/mongodb/models/gptAnalysis');

exports.saveGptAnalysis = async (data) => {
  const analysis = new GptAnalysis(data);
  return await analysis.save();
};

exports.getGptAnalysesByTestIdAndType = async (testId, type) => {
  return await GptAnalysis.find({ testId, type }).sort({ video_timestamp: 1 });
};
