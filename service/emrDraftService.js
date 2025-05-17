const axios = require('axios');
require('dotenv').config();

// 모델 임포트
const GptAnalysis = require('../database/mongodb/models/gptAnalysis');
const Note = require('../database/mongodb/models/note');
const HTPReport = require('../database/mongodb/models/htpReport');

/**
 * GPT 응답을 HTPReport 모델 형식으로 변환하는 함수
 */
const transformGptResponseToHTPReport = (gptResponse, testId, drawingType) => {
  // 기본 리포트 객체 초기화
  const report = {
    testId: testId
  };

  // Elements에 있는 정보를 HTPReport 스키마에 맞게 매핑
  if (gptResponse && gptResponse.elements) {
    gptResponse.elements.forEach(element => {
      // 요소가 존재하는 경우에만 처리
      if (element.exists === 'O') {
        const field = {
          expression: element.features || '',
          interpretation: element.interpretation || ''
        };

        // 그림 유형과 요소 이름에 따라 필드 매핑
        const name = element.name.toLowerCase();
        
        switch (drawingType) {
          case 'house':
            if (name.includes('주제')) report.houseSubject = field;
            else if (name.includes('지붕')) report.houseRoof = field;
            else if (name.includes('벽')) report.houseWall = field;
            else if (name.includes('문')) report.houseDoor = field;
            else if (name.includes('창문')) report.houseWindow = field;
            else if (name.includes('기타')) report.houseOthers = field;
            break;
            
          case 'tree':
            if (name.includes('주제')) report.treeSubject = field;
            else if (name.includes('줄기')) report.treeStem = field;
            else if (name.includes('가지')) report.treeBranch = field;
            else if (name.includes('수관')) report.treeCrown = field;
            else if (name.includes('기타')) report.treeOthers = field;
            break;
            
          case 'man':
            if (name.includes('주제') || name.includes('행동')) report.manSubject = field;
            else if (name.includes('성차')) report.manGenderExpression = field;
            else if (name.includes('머리')) report.manHead = field;
            else if (name.includes('눈코입') || name.includes('표정')) report.manFace = field;
            else if (name.includes('몸통')) report.manTorso = field;
            else if (name.includes('팔')) report.manArm = field;
            else if (name.includes('다리')) report.manLeg = field;
            else if (name.includes('손')) report.manHand = field;
            else if (name.includes('발')) report.manFoot = field;
            else if (name.includes('기타')) report.manOthers = field;
            else if (name.includes('인물') || name.includes('캐릭터')) report.manCharacter = field;
            break;
            
          case 'woman':
            if (name.includes('주제') || name.includes('행동')) report.womanSubject = field;
            else if (name.includes('성차')) report.womanGenderExpression = field;
            else if (name.includes('머리')) report.womanHead = field;
            else if (name.includes('눈코입') || name.includes('표정')) report.womanFace = field;
            else if (name.includes('몸통')) report.womanTorso = field;
            else if (name.includes('팔')) report.womanArm = field;
            else if (name.includes('다리')) report.womanLeg = field;
            else if (name.includes('손')) report.womanHand = field;
            else if (name.includes('발')) report.womanFoot = field;
            else if (name.includes('기타')) report.womanOthers = field;
            else if (name.includes('인물') || name.includes('캐릭터')) report.womanCharacter = field;
            break;
        }
      }
    });
  }

  return report;
};

/**
 * GPT-4o API Function Calling 호출 함수
 */
const callGpt4oApi = async (prompt) => {
  try {
    // Function calling 설정
    const functions = [
      {
        name: "generateHTPReport",
        description: "HTP 검사 데이터를 분석하여 구조화된 보고서를 생성합니다",
        parameters: {
          type: "object",
          properties: {
            overallImpression: {
              type: "string",
              description: "전체 그림에 대한 언급(데이터에 있는 내용만)"
            },
            elements: {
              type: "array",
              description: "그림의 각 요소에 대한 분석",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "요소 이름"
                  },
                  exists: {
                    type: "string",
                    description: "존재 여부 (O 또는 X)",
                    enum: ["O", "X"]
                  },
                  features: {
                    type: "string",
                    description: "표현의 특징(언급된 경우만)"
                  },
                  interpretation: {
                    type: "string",
                    description: "상징과 해석(언급된 경우만)"
                  }
                },
                required: ["name", "exists"]
              }
            }
          },
          required: ["overallImpression", "elements"]
        }
      }
    ];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'HTP (House-Tree-Person) 심리 검사 분석을 위한 전문 도우미입니다. 제공된 함수 스키마에 맞게 JSON 형식으로 응답해주세요.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      functions: functions,
      function_call: { name: "generateHTPReport" },
      temperature: 0.3,
      max_tokens: 3000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Function calling 결과에서 JSON 데이터 추출
    const functionCall = response.data.choices[0].message.function_call;
    if (functionCall && functionCall.name === 'generateHTPReport') {
      return JSON.parse(functionCall.arguments);
    } else {
      throw new Error('GPT-4o API에서 유효한 함수 호출 응답을 받지 못했습니다');
    }
  } catch (error) {
    console.error('GPT-4o API 호출 오류:', error.response?.data || error.message);
    throw new Error('GPT-4o API 응답 실패');
  }
};

/**
 * 메인 함수: HTP 보고서 생성
 * @param {Number} testId - 테스트 ID
 * @param {Array} types - 분석할 그림 유형 배열 ['house', 'tree', 'man', 'woman']
 */
const generateHTPReport = async (testId, types) => {
  try {
    if (!testId || !types || !Array.isArray(types) || types.length === 0) {
      throw new Error('유효하지 않은 입력. testId와 types 배열이 필요합니다.');
    }
    
    const results = {};
    let existingReport = await HTPReport.findOne({ testId });
    
    // 각 그림 유형별로 처리
    for (const type of types) {
      if (!['house', 'tree', 'man', 'woman'].includes(type)) {
        results[type] = { error: '유효하지 않은 그림 유형' };
        continue;
      }
      
      try {
        // gptAnalysis 컬렉션에서 데이터 가져오기
        const gptAnalysisData = await GptAnalysis.findOne({ testId, type });
        
        if (!gptAnalysisData) {
          results[type] = { error: '분석 데이터를 찾을 수 없음' };
          continue;
        }
        
        // notes 컬렉션에서 데이터 가져오기
        const notesData = await Note.findOne({ testId, type });
        
        // 노트 데이터 처리
        let formattedNotes = '상담사 해석 데이터가 없습니다.';
        if (notesData && notesData.notes && notesData.notes.length > 0) {
          formattedNotes = notesData.notes.map(note => `- ${note.timestamp}: ${note.content}`).join('\n');
        }
        
        // GPT-4o 프롬프트 준비
        const prompt = createPromptForReportGeneration(
          gptAnalysisData, 
          formattedNotes, 
          type
        );
        
        // GPT-4o API 호출 (Function Calling 사용)
        const gptResponse = await callGpt4oApi(prompt);
        
        // GPT 응답을 HTPReport 스키마에 맞게 변환 (이미 JSON이므로 파싱 불필요)
        const reportData = transformGptResponseToHTPReport(gptResponse, testId, type);
        
        // 기존 리포트가 있는지 확인하고 해당 타입의 필드만 업데이트
        if (existingReport) {
          // 해당 타입의 필드만 업데이트
          for (const [key, value] of Object.entries(reportData)) {
            if (key !== 'testId') { // testId는 제외
              existingReport[key] = value;
            }
          }
          await existingReport.save();
          results[type] = { success: true, message: '리포트가 업데이트되었습니다.' };
        } else {
          // 새 리포트 생성
          existingReport = new HTPReport(reportData);
          await existingReport.save();
          results[type] = { success: true, message: '리포트가 생성되었습니다.' };
        }
        
      } catch (error) {
        console.error(`${type} 처리 중 오류:`, error);
        results[type] = { error: error.message };
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('HTP 리포트 생성 중 오류:', error);
    throw new Error('HTP 리포트 생성 실패');
  }
};

/**
 * 기존 createPromptForReportGeneration 함수의 개선된 버전
 */
const createPromptForReportGeneration = (drawingData, counselorNotes, drawingType) => {
  // 그림 유형에 따른 분석 요소 지정
  let analysisElements = [];
  switch (drawingType) {
    case 'house':
      analysisElements = ['주제', '지붕', '벽', '문', '창문', '기타 요소'];
      break;
    case 'tree':
      analysisElements = ['주제', '줄기', '가지', '수관', '기타 요소'];
      break;
    case 'man':
    case 'woman':
      analysisElements = ['주제와 행동', '성차의 표현', '머리', '눈코입 표정', '몸통', 
                         '팔', '다리', '손', '발', '기타 요소', '그 밖의 인물'];
      break;
    default:
      analysisElements = ['주요 요소'];
  }
  
  // 타임라인 데이터 텍스트화
  const timelineText = drawingData.events && drawingData.events.length > 0
    ? drawingData.events.map(e => `- ${e.video_timestamp}: ${e.description}`).join('\n')
    : '타임라인 데이터가 없습니다.';
  
  // 프롬프트 구성
  return `
아동의 HTP 검사 중 "${drawingType === 'house' ? '집' : drawingType === 'tree' ? '나무' : drawingType === 'man' ? '남자' : '여자'}" 그림에 대한 분석 보고서를 정리해주세요.

## 제공된 데이터
1. 그림 타임라인 데이터:
${timelineText}

2. 상담사의 해석 노트:
${counselorNotes}

## 요청 사항
위 데이터를 바탕으로 HTP 검사 보고서를 작성해주세요. 당신의 역할은 상담사가 작성한 메모와 타임라인 데이터를 정리하여 구조화된 형태로 변환하는 것입니다.

## 작성 지침
- 오직 제공된 데이터에 있는 내용만 사용하세요. 자체적인 의견이나 해석을 추가하지 마세요.
- 데이터에 명시적으로 언급된 내용만 정확히 전달하세요.
- 객체가 언급되지 않았다면, "exists" 필드에 "X"만 표시하고 "features"와 "interpretation" 필드는 비워두세요.
- 모든 요소에 대해 평가를 제공하지 마세요. 데이터에 언급된 요소만 포함하세요.
- 전체적 느낌은 상담사 노트나 타임라인 데이터에서 전체 그림에 대한 언급을 요약하여 작성하세요.

## 객체 존재 여부 판단 기준
- 요소가 데이터에 명확히 언급되었을 경우에만 "O"로 표시
- 언급되지 않았거나 "없음"으로 명시된 경우 "X"로 표시
- "X"로 표시된 항목은 features와 interpretation 필드를 비워두세요

## 응답 형식
함수 호출 형식으로 정확히 응답해주세요. 응답에는 다음 필드가 있어야 합니다:
- overallImpression: 전체 그림에 대한 언급(데이터에 있는 내용만)
- elements: 각 요소에 대한 객체 배열 (name, exists, features, interpretation)

제공된 데이터에 있는 내용만 정확하게 포함시키고, 존재하지 않는 항목에는 내용을 입력하지 마세요.`;
};

/**
 * API 라우터에서 사용할 엔드포인트
 */
const setupEmrDraftRoutes = (router) => {
  router.post('/generate-htp-report', async (req, res) => {
    try {
      const { testId, types } = req.body;
      const results = await generateHTPReport(testId, types);
      return res.status(200).json(results);
    } catch (error) {
      console.error('HTP 리포트 생성 API 오류:', error);
      return res.status(500).json({ error: '서버 내부 오류' });
    }
  });
  
  return router;
};

module.exports = {
  generateHTPReport,
  setupEmrDraftRoutes
};