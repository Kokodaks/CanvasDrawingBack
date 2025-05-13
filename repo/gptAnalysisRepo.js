const GptAnalysis = require('../database/mongodb/models/gptAnalysis');

exports.saveGptAnalysis = async (testId, type, data) => {
  const analysis = new GptAnalysis({
    testId : testId,
    type : type,
    data : data,
  });
  return await analysis.save();
};

exports.getGptAnalysesByTestIdAndType = async (testId, type) => {
  return await GptAnalysis.find({ testId, type }).sort({ video_timestamp: 1 });
};
