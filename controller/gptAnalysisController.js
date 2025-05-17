const gptAnalysisService = require('../service/gptAnalysisService');

exports.saveGptAnalysis = async (req, res) => {
  try {
    const { testId, type, events } = req.body;
    const parsedTestId = Number(testId);

    const result = await gptAnalysisService.saveGptAnalysis(parsedTestId, type, events);
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

    const parsedTestId = Number(testId); // 여기서 명확하게 변환

    const results = await gptAnalysisService.getGptAnalyses(parsedTestId, type);
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
