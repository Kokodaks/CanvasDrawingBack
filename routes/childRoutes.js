const express = require('express');
const router = express.Router();
const childController = require('../controller/childController');


router.post('/createChild',
    
    childController.createChild);


router.get('/getAllChildrenByUser', 
    
    childController.getAllChildrenByUser);

router.delete('/deleteChild', 
    
    childController.deleteChild);

module.exports = router;
