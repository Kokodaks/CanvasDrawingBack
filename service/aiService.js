const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const gptAnalysisService = require('../service/gptAnalysisService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const saveDir = path.join(__dirname, '..', 'ai_uploads');
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

exports.processFinalDrawing = async (testId, finalImageBuffer, finalDrawing, drawingType) => {
  try {
    const timestamp = Date.now();
    const imagePath = path.join(saveDir, `${testId}_final_${drawingType}_${timestamp}.png`);
    const drawingPath = path.join(saveDir, `${testId}_final_${drawingType}_${timestamp}.json`);

    fs.writeFileSync(imagePath, finalImageBuffer);
    fs.writeFileSync(drawingPath, JSON.stringify(finalDrawing, null, 2));

    const base64Image = finalImageBuffer.toString('base64');

    let objectElements = '';
    let objectDescription = '';
    switch (drawingType) {
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

    const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 완성했습니다.
이 그림은 7-13세 아동이 그린 것으로, 심리상담사가 활용할 분석 자료입니다.

제공된 이미지와 좌표 데이터를 분석하여 다음 정보를 추출해주세요:

1. 주요 객체 식별 및 타임스탬프 기록 (MM:SS 형식)
2. 각 객체의 크기, 위치, 선의 특성, 구조 등 객관적 설명

타임스탬프는 strokeStartTime(밀리초)을 (밀리초 / 1000) → MM:SS로 변환하여 작성해주세요.

결과는 반드시 다음 JSON 형식으로 출력해주세요. 마크다운 \`\`\`json 블록으로 감싸주세요:

\`\`\`json
{
  "objectiveSummary": "...",
  "objectsTimestamps": [
    {
      "event": "크고 중앙에 위치한 정사각형 벽",
      "timestamp": "00:34"
    },
    ...
  ]
}
\`\`\`

주의: 감정, 심리적 해석은 포함하지 말고 객관적 분석만 작성해주세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
            {
              type: 'text',
              text: `좌표 데이터는 다음과 같습니다: \n\n${JSON.stringify(finalDrawing, null, 2)}`
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    const responseContent = response.choices[0].message.content;

    const cleanedJsonString = extractJsonFromMarkdown(responseContent);
    const parsedResponse = parseJSONResponse(cleanedJsonString);

    const events = [];
    if (parsedResponse.objectsTimestamps && Array.isArray(parsedResponse.objectsTimestamps)) {
      for (const obj of parsedResponse.objectsTimestamps) {
        events.push({
          event_type: 'object',
          description: obj.event,
          video_timestamp: obj.timestamp
        });
      }
    }

    console.log(`저장할 이벤트 데이터 수: ${events.length}`);
    if (events.length > 0) {
      console.log("첫 번째 이벤트:", JSON.stringify(events[0], null, 2));
    }

    let savedData = null;
    if (events.length > 0) {
      const numericTestId = parseInt(testId);
      savedData = await gptAnalysisService.saveGptAnalysis(numericTestId, drawingType, events);
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
      summary: parsedResponse.objectiveSummary
    };
  } catch (err) {
    console.error("최종 그림 처리 오류:", err);
    throw new Error(`최종 그림 처리 실패: ${err.message}`);
  }
};

// 마크다운 제거 함수
function extractJsonFromMarkdown(responseContent) {
  const match = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
  return match ? match[1] : responseContent;
}

// JSON 파싱 함수
function parseJSONResponse(cleanedJsonString) {
  try {
    return JSON.parse(cleanedJsonString);
  } catch (err) {
    console.error("JSON 파싱 오류:", err.message);
    return { error: "JSON 파싱 실패", raw: cleanedJsonString };
  }
}
