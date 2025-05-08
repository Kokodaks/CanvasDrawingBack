const childRepo = require('../repo/childRepo');

exports.createChild = async (childData) => {
    try {
        return await childRepo.createChild(childData);
    } catch (error) {
        throw new Error('Child creation failed: ' + error.message);
    }
};

exports.getAllChildrenByUser = async (userid) => {
    try {
        return await childRepo.getAllChildrenByUser(userid);
    } catch (error) {
        throw new Error('Failed to get children: ' + error.message);
    }
};

exports.deleteChildBySSN = async (ssn) => {
    try {
        const deleted = await childRepo.deleteChildBySSN(ssn);
        if (deleted === 0) {
            throw new Error('No child found with that SSN');
        }
        return true;
    } catch (error) {
        throw new Error('Child deletion failed: ' + error.message);
    }
};
