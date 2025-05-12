FROM node:18

# 1. 작업 디렉토리
WORKDIR /app

# 2. 의존성 설치
COPY package*.json ./
RUN npm install
RUN apt update && apt install -y default-mysql-client


# 3. 코드 복사
COPY . .

# 4. 포트 개방
EXPOSE 3000

# 5. 앱 실행
CMD ["node", "server.js"]
