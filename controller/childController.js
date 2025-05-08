const childService = require('../service/childService');


exports.createChild = async (req, res) => {
    try {
        const newChild = await childService.createChild(req.body);
        res.status(201).json(newChild);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        const { ssn, userid } = req.body;

        if (!ssn || !userid) {
            return res.status(400).json({ error: 'ssn and userid are required' });
        }

        const deleted = await childService.deleteChildBySSNAndUser(ssn, userid);

        if (!deleted) {
            return res.status(404).json({ error: 'No matching child found' });
        }

        res.status(200).json({ message: 'Child deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
