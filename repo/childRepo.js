const db = require('../database/mysql/models');
const { Children } = db;

exports.findChildBySSNAndUser = async (ssn, userid) => {
    return await Children.findOne({
        where: { ssn, userid }
    });
};

exports.findChildByIdAndUser = async (childid, userid) => {
    const child = await db.Children.findOne({
        where: { id: childid, userid }
    });
    return child;
};

exports.findChildByNameAndSsn = async (name, ssn) => {
    return await db.Children.findOne({
        where: {
            name,
            ssn
        }
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
