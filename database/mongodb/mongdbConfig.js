const mongoose = require('mongoose');
const dotenv = require('dotenv');

// NODE_ENV에 따라 .env 또는 .env.prod 사용
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({ path: envFile });

const connectMongoDB = async () => {
  try {
    // 공통 옵션
    const options = {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
      authMechanism: 'MONGODB-CR',
    };

    // production 환경일 경우 TLS 인증서 추가
    if (process.env.NODE_ENV === 'production') {
      options.tls = true;
      options.tlsCAFile = '/app/global-bundle.pem'; // Dockerfile에 반드시 포함!
    }

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
