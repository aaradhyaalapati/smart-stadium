import { Need } from '../types/domain';

export type IntentName = 'accessibility' | 'services' | 'schedule' | 'food_water' | 'navigation' | 'greeting' | 'unknown';
export type SupportedLanguage = 'en' | 'es' | 'fr';

export interface DetectedIntent {
  intent: IntentName;
  language: SupportedLanguage;
  need?: Need;
}

// Strip accents and lowercase
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface KeywordConfig {
  intent: IntentName;
  need?: Need;
  words: string[];
}

const languageKeywords: Record<SupportedLanguage, KeywordConfig[]> = {
  en: [
    { intent: 'greeting', words: ['hello', 'hi', 'hey', 'greetings'] },
    { intent: 'accessibility', need: 'mobility', words: ['wheelchair', 'ramp', 'elevator', 'mobility'] },
    { intent: 'accessibility', need: 'vision', words: ['blind', 'vision', 'braille'] },
    { intent: 'accessibility', need: 'hearing', words: ['deaf', 'hearing', 'assistive listening'] },
    { intent: 'accessibility', need: 'sensory', words: ['sensory', 'quiet', 'autism', 'loud'] },
    { intent: 'accessibility', need: 'general', words: ['accessible', 'accessibility', 'disabled', 'handicap'] },
    { intent: 'services', words: ['restroom', 'toilet', 'bathroom', 'first aid', 'medical', 'prayer', 'nursing'] },
    { intent: 'food_water', words: ['water', 'drink', 'food', 'hungry', 'thirsty'] },
    { intent: 'schedule', words: ['time', 'open', 'kickoff', 'start', 'schedule', 'gates'] },
    { intent: 'navigation', words: ['where', 'gate', 'navigate', 'directions', 'find'] }
  ],
  es: [
    { intent: 'greeting', words: ['hola', 'saludos', 'buenas'] },
    { intent: 'accessibility', need: 'mobility', words: ['silla de ruedas', 'rampa', 'elevador', 'ascensor', 'movilidad'] },
    { intent: 'accessibility', need: 'vision', words: ['ciego', 'vision', 'braille', 'visual'] },
    { intent: 'accessibility', need: 'hearing', words: ['sordo', 'audicion', 'auditivo'] },
    { intent: 'accessibility', need: 'sensory', words: ['sensorial', 'ruido', 'autismo', 'tranquilo'] },
    { intent: 'accessibility', need: 'general', words: ['accesible', 'accesibilidad', 'discapacidad', 'minusvalido'] },
    { intent: 'services', words: ['bano', 'aseo', 'sanitario', 'primeros auxilios', 'medico', 'oracion', 'lactancia'] },
    { intent: 'food_water', words: ['agua', 'beber', 'comida', 'hambre', 'sed'] },
    { intent: 'schedule', words: ['hora', 'abierto', 'inicio', 'empezar', 'horario', 'puertas'] },
    { intent: 'navigation', words: ['donde', 'puerta', 'navegar', 'direcciones', 'encontrar'] }
  ],
  fr: [
    { intent: 'greeting', words: ['bonjour', 'salut', 'coucou'] },
    { intent: 'accessibility', need: 'mobility', words: ['fauteuil roulant', 'rampe', 'ascenseur', 'mobilite'] },
    { intent: 'accessibility', need: 'vision', words: ['aveugle', 'vision', 'braille', 'visuel'] },
    { intent: 'accessibility', need: 'hearing', words: ['sourd', 'audition', 'auditif'] },
    { intent: 'accessibility', need: 'sensory', words: ['sensoriel', 'bruit', 'autisme', 'calme'] },
    { intent: 'accessibility', need: 'general', words: ['accessible', 'accessibilite', 'handicap', 'invalide'] },
    { intent: 'services', words: ['toilettes', 'bain', 'premiers secours', 'medical', 'priere', 'allaitement'] },
    { intent: 'food_water', words: ['eau', 'boire', 'nourriture', 'faim', 'soif'] },
    { intent: 'schedule', words: ['heure', 'ouvert', 'debut', 'commencer', 'horaire', 'portes'] },
    { intent: 'navigation', words: ['ou', 'porte', 'naviguer', 'directions', 'trouver'] }
  ]
};

export function detectIntent(message: string): DetectedIntent {
  const normMessage = normalizeText(message);
  
  // Create word-boundary regexes dynamically
  const hasWord = (word: string) => {
    const normWord = normalizeText(word);
    // \b doesn't work perfectly for all non-ASCII, but since we stripped accents, it works for basic english/spanish/french [a-z]
    const regex = new RegExp(`\\b${normWord}\\b`, 'i');
    return regex.test(normMessage);
  };

  // Check language explicitly, or default to English structure for iteration
  for (const lang of ['en', 'es', 'fr'] as SupportedLanguage[]) {
    const configs = languageKeywords[lang];
    for (const config of configs) {
      for (const word of config.words) {
        if (hasWord(word)) {
          return {
            intent: config.intent,
            language: lang,
            need: config.need
          };
        }
      }
    }
  }

  return { intent: 'unknown', language: 'en' };
}
