const express = require('express');
const router = express.Router();
const childController = require('../controller/childController');

//아이 생성
router.post('/createChild',
    
    childController.createChild);

//유저 모든 아이 반환
router.get('/getAllChildrenByUser', 
    
    childController.getAllChildrenByUser);

//해당 유저의 아이 삭제
router.delete('/deleteChild', 
    
    childController.deleteChild);

module.exports = router;
