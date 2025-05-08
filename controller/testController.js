const testService = require('../service/testService');

exports.createTest = async (req, res) => {
    try {
        const test = await testService.createTest(req.body);
        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllTestsByUser = async (req, res) => {
    try {
        const { userid } = req.query;
        const tests = await testService.getAllTestsByUser(userid);
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTestsByChild = async (req, res) => {
    try {
        const { childid } = req.params;
        const tests = await testService.getTestsByChild(childid);
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const { id, userid } = req.body;
        const result = await testService.deleteTest(id, userid);
        if (!result) return res.status(403).json({ error: 'Unauthorized or not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTestBySsn = async (req, res) => {
    try {
        const { name, ssn } = req.query;
        const result = await testService.getTestBySsn(name, ssn);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markTestAsCompleted = async (req, res) => {
    try {
        const { testid } = req.body;
        const updated = await testService.markTestAsCompleted(testid);
        if (!updated) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json({ message: 'Test marked as completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};