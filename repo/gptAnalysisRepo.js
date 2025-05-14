const GptAnalysis = require('../database/mongodb/models/gptAnalysis');

exports.saveGptAnalysis = async (testId, type, events) => {
  const analysis = new GptAnalysis({
    testId : testId,
    type : type,
    events : events,
  });
  return await analysis.save();
};

exports.getGptAnalysesByTestIdAndType = async (testId, type) => {
  return await GptAnalysis.find({ testId, type }).sort({ video_timestamp: 1 });
};
