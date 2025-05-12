const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    let mongoURI;
    let options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (process.env.NODE_ENV === 'production') {
      // Docker 환경 → Atlas URI 단일 사용
      mongoURI = process.env.MONGODB_URI;
    } else {
      // 로컬 환경 → 수동 조합
      mongoURI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`;
    }

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
