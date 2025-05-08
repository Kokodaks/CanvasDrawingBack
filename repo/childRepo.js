const db = require('../database/mysql/models');
const { Children } = db;

exports.createChild = async (childData) => {
    return await Children.create(childData);
};

exports.getAllChildrenByUser = async (userid) => {
    return await Children.findAll({ where: { userid } });
};

exports.deleteChildBySSN = async (ssn) => {
    return await Children.destroy({ where: { ssn } });
};
