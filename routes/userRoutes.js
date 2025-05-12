const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');



//유저 생성
router.post('/createUser',
     userController.createUser);

//유저 삭제
router.delete('/deleteUser', 
    
    userController.deleteUser);

//유저 찾기(자격증)
router.get('/findUser', 
    
    userController.findUserByLicenseNo);



//유저 찾기(이메일&패스워드)
router.post('/findByEmailAndPassword',
     userController.findUserByEmailAndPassword);




module.exports = router;