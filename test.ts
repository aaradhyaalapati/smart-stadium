import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('test');
const model = genAI.getGenerativeModel({ model: 'google/gemini-1.5-flash' }, { baseUrl: 'https://openrouter.ai/api/v1' });
console.log(model);
