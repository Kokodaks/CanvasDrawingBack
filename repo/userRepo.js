const { Op } = require('sequelize');
const db = require('../database/mysql/models');

exports.create = async ({ name, phone_no, email, password, license_type, license_no }) => {
    const user = await db.Users.create({ name, phone_no, email, password, license_type, license_no });
    return user;
};

exports.findByLicenseNo = async (license_no) => {
    return await db.Users.findOne({ where: { license_no } });
};

exports.deleteByLicenseNo = async (license_no) => {
    const result = await db.Users.destroy({ where: { license_no } });
    return result > 0;
};


exports.findByEmailAndPassword = async (email, password) => {
    const user = await db.Users.findOne({
      where: {
        email,
        password,
      },
    });
    return user;
  };
  
exports.updateUserByLicenseNo = async ({ license_no, name, phone_no, email, password, license_type }) => {
    const [affectedRows] = await db.Users.update(
        { name, phone_no, email, password, license_type },
        { where: { license_no } }
    );

    if (affectedRows === 0) {
        throw new Error('No changes made');
    }

    return await db.Users.findOne({ where: { license_no } });
};