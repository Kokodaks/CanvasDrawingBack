// const userService = require('../service/userService');

// exports.createUser = async (req, res) => {
//     try{
//         const { name, email, password, license_type, license_no } = req.body;
//         const user = await userService.findUserByLicense_no(license_no);
//         if(user){
//             return res.status(401).json({message: 'cannot create another account with this email. use a different email address'});
//         }
//         const {newUser, token} = await userService.createUser(username, email, password);
//         return res.status(201).json({message: '✅ User created successfully', user: newUser, token: token});
//     }catch(error){
//         return res.status(500).json({message: '❌ Error creating user', error: error.message});
//     }
// }