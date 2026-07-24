# 드로잉 아이 (DrawingI) - Backend

House-Tree-Person (HTP) 그림 심리 검사를 비대면으로 진행하고, 그림의 리컨스트럭션(Reconstruction), AI 기반 1차원적 분석, 풀 영상 스트리밍을 제공하는 백엔드 시스템입니다. 심리상담가의 업무 편의성을 극대화하며, 부모와 아이가 높은 접근성으로 심리 검사를 진행할 수 있도록 지원합니다.

## 🛠 Tech Stack
- **Language & Runtime**: Node.js 18
- **Database**: 
  - **MySQL** (Sequelize ORM, `mysql2`): 사용자(상담사), 아동, 검사 세션 등 정형(Relational) 데이터 관리
  - **MongoDB** (Mongoose): 스트로크 좌표, HTP 보고서, GPT 분석 데이터, QnA, 상담사 노트 등 비정형/시계열 데이터 관리
- **Cloud & Infra**: AWS S3 (`aws-sdk`), GitHub Actions (CI/CD 배포 자동화), Docker
- **AI**: OpenAI API (`openai`, GPT-4o, GPT-4.1-mini)

## 🏗 Architecture & Design
- **3-Layered Architecture**: Controller, Service, Repository 계층으로 책임을 명확히 분리하여 비즈니스 로직의 독립성과 유지보수성을 높였습니다.
- **Polyglot Persistence (RDBMS + NoSQL)**: 
  - **MySQL (`users`, `children`, `tests`)**: 상담사 정보, 내담 아동 정보, 그리고 검사 완료 여부 및 일자 등의 핵심 관계형 데이터를 관리하며 `CASCADE` 옵션을 통해 데이터 무결성을 보장합니다.
  - **MongoDB (`drawing_strokes`, `final_strokes`, `htpReport`, `gptAnalysis` 등)**: 대용량 좌표 배열 데이터와 유동적인 AI 리포트 스키마, 시계열 노트를 저장하여 최적의 성능을 냅니다.
- **Dynamic Environment Isolation**: `server.js` 초기화 단계에서 `NODE_ENV`(`production` 또는 개발 환경)에 따라 `.env.prod` 혹은 `.env` 설정을 동적으로 로드하고, 운영 환경에서는 AWS S3로, 개발/테스트 환경에서는 로컬 파일 시스템(`ai_uploads/`, `downloads/`)으로 미디어 처리 경로를 분기합니다.

## 📌 Core Features
### 1. 드로잉 데이터 재구성 및 이벤트 추출 (Reconstruction)
- 사용자가 그린 그림의 좌표(`x`, `y`), 시간(`t`), 필압(`p`) 데이터를 수집하여 MongoDB(`drawing_strokes`, `final_strokes`)에 저장합니다.
- 하우스돌프 거리(Hausdorff Distance) 알고리즘과 클러스터링을 적용해 덧그린 선(Bulk Repeat)을 판별하고, 획의 속도와 굵기를 계산하여 유의미한 심리 분석 지표(`event_strokes`)를 자동 추출합니다.

### 2. AI 기반 HTP 심리 분석 및 EMR 자동 기입
- **타임스탬프 추출**: 완성된 그림과 좌표 데이터를 GPT 비전 모델에 전송하여 지붕, 문, 창문 등 주요 객체가 언제 그려졌는지 정확한 타임스탬프(MM:SS)를 추출합니다.
- **보고서(EMR) 자동 생성**: AI가 추출한 타임라인 데이터와 상담사가 작성한 노트(`Note`)를 융합한 뒤, GPT-4o의 Function Calling을 활용해 구조화된 HTP 심리 검사 보고서 초안(`HTPReport`)을 자동 생성하고 DB에 기입합니다.

### 3. 검사 영상 청크 스트리밍
- HTP 검사 진행 풀 영상을 AWS S3에 안전하게 업로드하고 관리합니다.
- 심리상담가가 웹에서 영상을 시청할 때, HTTP `Range` 헤더를 활용해 206 Partial Content 상태 코드로 영상을 Chunk 단위로 스트리밍하여 서버 부하를 줄이고 빠른 탐색(Seek)을 지원합니다.

### 4. 상담 기록 및 문답 관리
- 그림의 각 유형(House, Tree, Man, Woman)별로 내담자와의 문답(`DrawingQnA`) 내역과 상담사의 실시간 메모(`Note`)를 MongoDB에 체계적으로 저장하여 분석 보고서의 기반 데이터로 활용합니다.

## 🚀 Trouble Shooting
- **대용량 검사 영상 스트리밍 시 서버 및 네트워크 병목 현상**
  - **문제**: 상담가가 대용량의 검사 풀 영상을 재생할 때, 전체 파일을 한 번에 메모리에 올리거나 전송하면 서버 부하와 클라이언트 딜레이가 심하게 발생.
  - **해결**: 클라이언트의 HTTP `Range` 헤더 요청을 파싱하여, AWS S3의 `getObject` API를 ReadStream으로 읽어오도록 파이프(`pipe`)를 연결했습니다. 이를 통해 영상을 필요한 구간(Chunk) 단위로 쪼개어 응답함으로써 스트리밍 성능과 메모리 효율을 대폭 개선했습니다.

- **HTP 객체 인식 시 AI의 환각(Hallucination) 문제**
  - **문제**: GPT 모델에게 단순히 그림 이미지만 제공했을 때, 특정 선이 어떤 객체(문, 창문 등)인지 정확히 매핑하지 못하거나 시점을 착각하는 문제 발생.
  - **해결**: 그림 파일과 함께 전체 획의 `JSON` 좌표 데이터(x,y,t,p)를 함께 제공하고, 밀리초(ms)를 MM:SS 형식으로 변환하는 명확한 수학적 규칙과 객체별 매칭 가이드라인을 프롬프트로 주입했습니다. 또한 Function Calling을 강제하여 AI의 응답을 `HTPReport` 스키마 구조에 맞게 고정시켜 환각을 통제했습니다.

## ⚙️ Getting Started

프로젝트를 로컬 환경에서 실행하거나 Docker를 통해 구동하는 방법입니다.

```bash
# 1. 패키지 설치
$ npm install

# 2. 환경 변수 설정
# 루트 디렉토리에 .env 및 .env.prod 파일을 생성하고 아래 항목을 구성합니다.
# - MySQL / MongoDB URI
# - AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / S3_BUCKET_NAME
# - OPENAI_API_KEY

# 3. 서버 실행
$ npm start
# 또는 직접 Node로 실행
$ node server.js
