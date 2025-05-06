// const childService = require('../service/childService');

// require('dotenv').config();

// //아이 등록하기
// exports.createChild = async(req, res) => {
//     try{
//         console.log("📥 Incoming Request Body: ", req.body);
//         const { name, ssn, userid} = req.body;
//         const {newChild, newAuth} = await childService.createChild(gender, ssn, name, req.user.id,);
//         return res.status(201).json({message: '✅ Child and relationship with child created successfully', child: newChild, auth: newAuth});
//     }catch(error){
//         return res.status(500).json({message: '❌ Error creating child', error: error.message});
//     }
// }

