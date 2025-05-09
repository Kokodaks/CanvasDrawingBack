const userRepo = require('../repo/userRepo');

exports.createUser = async (userData) => {
    const existing = await userRepo.findByLicenseNo(userData.license_no);
    if (existing) {
        throw new Error('User with this license number already exists');
    }
    return await userRepo.create(userData);
};

exports.deleteUser = async (license_no) => {
    const deleted = await userRepo.deleteByLicenseNo(license_no);
    if (!deleted) {
        throw new Error('User not found or already deleted');
    }
};

exports.findUserByLicenseNo = async (license_no) => {
    return await userRepo.findByLicenseNo(license_no);
};

exports.findUserByEmailAndPassword = async (email, password) => {
    return await userRepo.findByEmailAndPassword(email, password);
  };