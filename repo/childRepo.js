const db = require('../database/mysql/models');
const { Children } = db;

exports.findChildBySSNAndUser = async (ssn, userid) => {
    return await Children.findOne({
        where: { ssn, userid }
    });
};

exports.createChild = async (childData) => {
    return await Children.create(childData);
};

exports.getAllChildrenByUser = async (userid) => {
    return await Children.findAll({ where: { userid } });
};

exports.deleteChildBySSNAndUser = async (ssn, userid) => {
    const result = await Children.destroy({
        where: {
            ssn,
            userid
        }
    });

    return result > 0;
};
