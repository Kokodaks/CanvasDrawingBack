const fs = require('fs');
const path = require('path');
const {OpenAI} = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const saveDir = path.join(__dirname, '..','ai_uploads');

exports.convertToFile = async(duringImgBuffer, currentDrawing) => {
    try{
        
        const duringImgPath = path.join(saveDir, 'duringImg.png');
        const currentDrawingPath = path.join(saveDir, 'currentDrawing.json');

        fs.writeFileSync(duringImgPath, duringImgBuffer);
        fs.writeFileSync(currentDrawingPath, JSON.stringify(currentDrawing, null, 2));
        
        console.log("Successfully converted and saved to /ai_uploads");
    }catch(error){
        console.log({message : "aiService convertToFile", error : error.message});
    }
}

exports.convertFinalToFile = async(finalImageBuffer, finalDrawing) =>{
    try{
        const finalImgPath = path.join(saveDir, 'finalImg.png');
        const finalDrawingPath = path.join(saveDir, 'finalDrawing.json');
        
        fs.writeFileSync(finalImgPath, finalImageBuffer);
        fs.writeFileSync(finalDrawingPath, JSON.stringify(finalDrawing, null, 2));
        console.log("Successfully converted and saved to /ai_uploads");
    }catch(error){
        console.log({message : "aiService convertFinalToFile", error : error.message});
    }
}

exports.sendToOpenAi = async() =>{
    //이미지 (.png), json 파일 경로
    const beforeErasePath = path.join(__dirname, '../ai_uploads/beforeErase.png');
    const afterErasePath = path.join(__dirname, '../ai_uploads/afterErase.png');
    const currentDrawingPath = path.join(__dirname, '../ai_uploads/currentDrawing.json');
    
    //이미지 -> base64
    const beforeEraseImage = fs.readFileSync(beforeErasePath).toString('base64');
    const afterEraseImage = fs.readFileSync(afterErasePath).toString('base64');
    
    //좌표 json
    const currentDrawingJson = fs.readFileSync(currentDrawingPath, 'utf-8');

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages:[
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `사용자는 현재 htp 검사 중 집을 그리고 있어. 
                        사용자가 그리고 지워질때마다 before, after로 캡쳐가 돼.
                        이 프롬프트는 2개의 이미지와 좌표와 함께 보내져. 
                        너가 호출 되었다는건 사용자가 그림의 한 부분을 지웠기 때문이야.  
                        여기서 사용자가 그리면서 어떤것들이 지워졌는지 알려줘`,
                    },
                    {
                        type: "image_url",
                        image_url:{
                            url:`data:image/png;base64,${beforeEraseImage}`,
                        }
                    },
                    {
                        type: "image_url",
                        image_url:{
                            url:`data:image/png;base64,${afterEraseImage}`,
                        }
                    },
                    {
                        type: "text",
                        text: `좌표 데이터는 다음과 같습니다 : \n\n${currentDrawingJson}`,
                    }
                ]
            }
        ],
        max_tokens:1000,
    });
    console.log("🧠 GPT 응답:", response.choices[0].message.content);
}

exports.sendFinalToOpenAi = async() =>{
    const finalImgPath = path.join(__dirname, '../ai_uploads/finalImg.png');
    const finalDrawingPath = path.join(__dirname, '../ai_uploads/finalDrawing.json');
    
    const finalImage = fs.readFileSync(finalImgPath).toString('base64');
    const finalDrawingJson = fs.readFileSync(finalDrawingPath, 'utf-8');
    

    //좌표 json
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages:[
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `사용자는 현재 htp 검사 중 집을 완성했어. 
                        그림하고 좌표 데이터를 탐색해서 언제 어떤 객체가 탐지되는제 알려줘. `,
                    },
                    {
                        type: "image_url",
                        image_url:{
                            url:`data:image/png;base64,${finalImage}`,
                        }
                    },
                                        {
                        type: "text",
                        text: `좌표 데이터는 다음과 같습니다 : \n\n${finalDrawingJson}`,
                    }
                ]
            }
        ],
        max_tokens:1000,
    });
    console.log("🧠 GPT 응답:", response.choices[0].message.content);
}

