const express = require('express');
const router = express.Router();
const childController = require('../controller/testController');


router.post('/createTest',
    
    childController.createChild);


router.get('/getAllChildrenByUser', 
    
    childController.getAllChildrenByUser);

router.delete('/deleteChild', 
    
    childController.deleteChild);

module.exports = router;
