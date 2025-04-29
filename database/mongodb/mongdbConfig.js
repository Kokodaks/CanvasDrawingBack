const mongoose = require('mongoose'); 
require('dotenv').config();

const connectMongoDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            user: process.env.MONGODB_USER,
            pass: process.env.MONGODB_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.log('❌ MongoDB connection failed', error.message);
        process.exit(1);
    }
}

module.exports = connectMongoDB;