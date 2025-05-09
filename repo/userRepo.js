const { Op } = require('sequelize');
const db = require('../database/mysql/models');

exports.create = async ({ name, email, password, license_type, license_no }) => {
    const user = await db.Users.create({ name, email, password, license_type, license_no });
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
  
