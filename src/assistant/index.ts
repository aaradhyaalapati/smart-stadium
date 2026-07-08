import { runLiveLoop } from './liveEngine';
import { offlineAnswer } from '../offline/engine';
import { UserProfile } from '../offline/engine';
import { Content } from '@google/generative-ai';

export interface AnswerResult {
  mode: 'live' | 'offline';
  answer: string;
}

export async function answer(
  message: string,
  profile: UserProfile,
  history: Content[] = []
): Promise<AnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      mode: 'offline',
      answer: offlineAnswer(message, profile)
    };
  }

  try {
    const liveText = await runLiveLoop(apiKey, message, history);
    return {
      mode: 'live',
      answer: liveText
    };
  } catch (err: any) {
    // Determine if we should fall back or re-throw
    const errString = err.message || err.toString();
    const statusMatch = errString.match(/\[?(\d{3})\]?/);
    let statusCode = 0;
    
    if (statusMatch) {
      statusCode = parseInt(statusMatch[1], 10);
    } else if (err.status) {
      statusCode = err.status;
    }

    // Malformed request - re-raise genuinely
    if (statusCode === 400) {
      throw err;
    }

    // Fallback triggers: 401, 403, 404, 429, 5xx, or network/timeout
    const isFallbackStatus = statusCode === 401 || statusCode === 403 || statusCode === 404 || statusCode === 429 || (statusCode >= 500);
    const isTimeoutOrNetwork = errString.includes('TIMEOUT') || errString.includes('fetch') || errString.includes('network') || errString.includes('ITERATION_CAP');

    if (isFallbackStatus || isTimeoutOrNetwork) {
      return {
        mode: 'offline',
        answer: offlineAnswer(message, profile)
      };
    }

    // If it's something completely unexpected that wasn't matched above, rethrow
    throw err;
  }
}
