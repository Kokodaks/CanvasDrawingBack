const childService = require('../service/childService');

exports.createChild = async (req, res) => {
    try {
        const newChild = await childService.createChild(req.body);
        res.status(201).json(newChild);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllChildrenByUser = async (req, res) => {
    try {
        const { userid } = req.query;
        if (!userid) {
            return res.status(400).json({ error: 'userid is required' });
        }

        const children = await childService.getAllChildrenByUser(userid);
        res.status(200).json(children);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteChild = async (req, res) => {
    try {
        const { ssn } = req.body;
        if (!ssn) {
            return res.status(400).json({ error: 'ssn is required' });
        }

        await childService.deleteChildBySSN(ssn);
        res.status(200).json({ message: 'Child deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
