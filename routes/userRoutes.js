const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/createUser',
     userController.createUser);


router.delete('/deleteUser', 
    
    userController.deleteUser);


router.get('/findUser', 
    
    userController.findUserByLicenseNo);

module.exports = router;
