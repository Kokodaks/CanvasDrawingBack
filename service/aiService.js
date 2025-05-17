const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const gptAnalysisService = require('../service/gptAnalysisService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const saveDir = path.join(__dirname, '..', 'ai_uploads');

// 디렉토리가 없으면 생성
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

/**
 * 최종 그림 분석 및 객체 타임라인 생성
 * @param {number|string} testId - 테스트 ID
 * @param {Buffer} finalImageBuffer - 이미지 버퍼
 * @param {Object} finalDrawing - 그림 좌표 데이터
 * @param {string} drawingType - 그림 유형 (house, tree, man, woman)
 * @returns {Promise<Object>} 처리 결과
 */
exports.processFinalDrawing = async (testId, finalImageBuffer, finalDrawing, drawingType) => {
  try {
    // 이미지 저장
    const timestamp = Date.now();
    const imagePath = path.join(saveDir, `${testId}_final_${drawingType}_${timestamp}.png`);
    const drawingPath = path.join(saveDir, `${testId}_final_${drawingType}_${timestamp}.json`);
    
    fs.writeFileSync(imagePath, finalImageBuffer);
    fs.writeFileSync(drawingPath, JSON.stringify(finalDrawing, null, 2));
    
    // base64로 변환
    const base64Image = finalImageBuffer.toString('base64');
    
    // 그림 유형에 따른 세부 요소 정의
    let objectElements = '';
    let objectDescription = '';
    
    switch(drawingType) {
      case 'house':
        objectElements = '지붕, 벽, 문, 창문, 굴뚝, 연기, 울타리, 길, 연못, 산, 나무, 꽃, 잔디, 태양 등';
        objectDescription = '집';
        break;
      case 'tree':
        objectElements = '기둥, 수관, 가지, 뿌리, 나뭇잎, 꽃, 열매, 그네, 새, 다람쥐, 구름, 달, 별 등';
        objectDescription = '나무';
        break;
      case 'man':
        objectElements = '머리, 얼굴(눈, 코, 입, 귀), 머리카락, 목, 상체, 팔, 손, 다리, 발, 옷(단추, 주머니, 벨트), 신발, 액세서리(모자, 안경) 등';
        objectDescription = '남자';
        break;
      case 'woman':
        objectElements = '머리, 얼굴(눈, 코, 입, 귀), 머리카락, 목, 상체, 팔, 손, 다리, 발, 옷(단추, 주머니, 치마, 드레스), 신발, 액세서리(모자, 귀걸이, 목걸이) 등';
        objectDescription = '여자';
        break;
      default:
        objectElements = '주요 부분들';
        objectDescription = '그림';
    }
    
    // Function calling을 위한 함수 정의
    const functions = [
      {
        name: "analyzeDrawing",
        description: "아동이 그린 HTP 검사 그림을 분석하여 객체의 특징과 타임스탬프 정보를 반환합니다",
        parameters: {
          type: "object",
          properties: {
            objectiveSummary: {
              type: "string",
              description: "전체 그림에 대한 간략한 요약 (객관적 특성 중심)"
            },
            events: {
              type: "array",
              description: "그림 내 객체 정보 배열",
              items: {
                type: "object",
                properties: {
                  event_type: {
                    type: "string",
                    description: "이벤트 유형 (항상 'object'로 설정)",
                    enum: ["object"]
                  },
                  description: {
                    type: "string",
                    description: "객체와 그 특성에 대한 상세 설명 (크기, 위치, 선의 특성, 상세 특징 등)"
                  },
                  video_timestamp: {
                    type: "string",
                    description: "MM:SS 형식의 타임스탬프"
                  }
                },
                required: ["event_type", "description", "video_timestamp"]
              }
            }
          },
          required: ["objectiveSummary", "events"]
        }
      }
    ];
    
    // 프롬프트 구성
    const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 완성했습니다.
이 그림은 7-13세 아동이 그린 것으로, 심리상담사가 활용할 분석 자료입니다.

제공된 이미지와 좌표 데이터를 분석하여 다음 정보를 추출해주세요:

1. **객체 분석** (그림에 대한 객관적인 분석만 수행하며, 심리적 해석이나 의미 분석은 절대 포함하지 마세요):
   - 주요 객체 식별 및 시간 순서대로 나열 (정확한 타임스탬프 포함)
   - 각 객체의 객관적 특성: 
     * 크기(작음/중간/큼)
     * 위치(중앙/상단/하단/좌측/우측)
     * 선의 특성(굵기, 압력, 끊김 여부)
     * 상세 특징(형태, 비율, 구조적 특성)

   - 주요 관찰 대상: ${objectElements}

2. **타임스탬프 생성 규칙**:
   - 모든 타임스탬프는 정확히 MM:SS 형식으로 작성 (예: "01:23")
   - 각 객체가 그려진 정확한 시작 시간을 기록
   - 여러 획(stroke)으로 구성된 객체의 경우, 첫 번째 획의 시작 시간 사용
   - 획의 시작 시간은 strokeStartTime 값을 기준으로 변환

중요: 심리적 해석이나 감정 상태에 대한 추론, 의미 분석 등은 절대 포함하지 마세요. 오직 그림에서 관찰 가능한 객관적인 특성(크기, 위치, 선의 특징 등)만 분석하세요.

반드시 제공된 함수 스키마에 맞게 응답해주세요. 모든 객체 정보는 events 배열에 포함되어야 하며, 각 객체는 event_type이 "object"이고, description과 video_timestamp를 포함해야 합니다.`;
    
    // OpenAI API 호출 (Function Calling 사용)
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview", // 이미지 분석을 위해 Vision 모델 사용
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            },
            {
              type: "text",
              text: `좌표 데이터는 다음과 같은 구조로 제공됩니다:
              
각 획(stroke)은 다음 속성들을 포함합니다:
- isErasing: 지우개 사용 여부 (true/false)
- strokeOrder: 획의 순서 번호
- strokeStartTime: 획 시작 시간(밀리초 타임스탬프)
- color: 16진수 형식의 색상 코드
- points: 획을 구성하는 좌표점 배열, 각 점은 다음 구조를 가짐:
  - x: 가로 좌표
  - y: 세로 좌표

이 strokeStartTime을 이용하여 MM:SS 형식의 타임스탬프로 변환해주세요. 
밀리초는 다음과 같이 변환됩니다: (밀리초 / 1000) → SS 형식의 초로 변환
예: 65000 밀리초는 "01:05"로 변환

좌표 데이터는 다음과 같습니다: \n\n${JSON.stringify(finalDrawing, null, 2)}`
            }
          ]
        }
      ],
      functions: functions,
      function_call: { name: "analyzeDrawing" },
      max_tokens: 2000
    });
    
    // Function calling 결과 추출
    let functionResponse = null;
    if (response.choices[0].message.function_call) {
      try {
        functionResponse = JSON.parse(response.choices[0].message.function_call.arguments);
      } catch (e) {
        console.error("Function response 파싱 오류:", e);
        throw new Error("AI 응답 파싱에 실패했습니다");
      }
    } else {
      throw new Error("AI가 함수 응답을 반환하지 않았습니다");
    }
    
    // 이제 functionResponse에는 이미 필요한 형식으로 데이터가 포함되어 있음
    const { objectiveSummary, events } = functionResponse;
    
    // 데이터베이스에 저장
    let savedData = null;
    if (events && events.length > 0) {
      try {
        // testId를 숫자로 변환
        const numericTestId = parseInt(testId);
        // gptAnalysisService를 사용하여 DB에 저장
        savedData = await gptAnalysisService.saveGptAnalysis(numericTestId, drawingType, events);
        console.log("데이터베이스 저장 성공:", savedData._id);
      } catch (dbError) {
        console.error("데이터베이스 저장 오류:", dbError);
        throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
      }
    } else {
      console.warn("저장할 이벤트 데이터가 없습니다");
    }
    
    return {
      success: true,
      message: "그림 분석 및 저장 완료",
      data: {
        id: savedData?._id,
        testId: savedData?.testId,
        type: savedData?.type,
        eventsCount: savedData?.events?.length || 0
      },
      summary: objectiveSummary
    };
  } catch (error) {
    console.error("최종 그림 처리 오류:", error);
    throw new Error(`최종 그림 처리 실패: ${error.message}`);
  }
};
