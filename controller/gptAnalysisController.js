const gptAnalysisService = require('../service/gptAnalysisService');

exports.saveGptAnalysis = async (req, res) => {
  try {
    const {testId, type, events} = req.body;
    const result = await gptAnalysisService.saveGptAnalysis(testId, type, events);
    res.status(201).json({ message: 'Saved GPT Analysis', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGptAnalysis = async (req, res) => {
  try {
    const { testId, type } = req.query;
    if (!testId || !type) {
      return res.status(400).json({ error: 'testId and type are required' });
    }
    const results = await gptAnalysisService.getGptAnalyses(testId, type);
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
