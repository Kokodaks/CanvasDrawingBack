const userService = require('../service/userService');

exports.createUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await userService.createUser(userData);
        res.status(201).json({ message: 'User created successfully', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { license_no } = req.body;
        await userService.deleteUser(license_no);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.findUserByLicenseNo = async (req, res) => {
    try {
        const { license_no } = req.body;
        const user = await userService.findUserByLicenseNo(license_no);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
