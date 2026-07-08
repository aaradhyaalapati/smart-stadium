import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { assistantTools } from './tools';
import { SYSTEM_PROMPT } from './systemPrompt';
import { executeTool } from '../tools/executeTool';

const ITERATION_CAP = 8;
const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function runLiveLoop(
  apiKey: string,
  message: string,
  history: Content[] = []
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // We use gemini-1.5-flash as it is fast and supports tool calling
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: assistantTools }]
  });

  let currentHistory: Content[] = [...history];

  // We append the user message explicitly to start the loop
  const userContent: Content = { role: 'user', parts: [{ text: message }] };
  let currentParts: Part[] = [userContent.parts[0]!];
  let currentRole = 'user';

  for (let iteration = 0; iteration < ITERATION_CAP; iteration++) {
    // Send request
    const response = await withTimeout(
      model.generateContent({
        contents: [...currentHistory, { role: currentRole, parts: currentParts }]
      }),
      TIMEOUT_MS
    );

    const callResult = response.response;
    const functionCalls = callResult.functionCalls();
    
    // If no function calls, we have a final text answer
    if (!functionCalls || functionCalls.length === 0) {
      return callResult.text() || '';
    }

    // We must append the model's turn to history exactly as returned to maintain conversation state
    currentHistory.push({ role: currentRole, parts: currentParts });
    
    const candidateContent = callResult.candidates?.[0]?.content;
    if (candidateContent) {
      currentHistory.push({
        role: 'model',
        parts: candidateContent.parts
      });
    } else {
      throw new Error('No candidate content returned');
    }

    // Execute the tools locally
    const toolResults: Part[] = [];
    for (const call of functionCalls) {
      const toolResponseData = executeTool(call.name, call.args as Record<string, any>);
      toolResults.push({
        functionResponse: {
          name: call.name,
          response: toolResponseData
        }
      });
    }

    // Set up the next turn
    currentRole = 'user'; // Or function, depending on Gemini SDK requirement. GenAI expects 'user' or 'function'
    currentParts = toolResults;
  }

  // If we exit the loop, we hit the iteration cap.
  throw new Error('ITERATION_CAP_EXCEEDED');
}
