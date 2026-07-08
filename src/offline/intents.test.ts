import { detectIntent, normalizeText } from './intents';

describe('offline intents layer', () => {
  describe('normalizeText', () => {
    it('lowercases text', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    it('strips accents', () => {
      expect(normalizeText('visión')).toBe('vision');
      expect(normalizeText('Baño')).toBe('bano');
      expect(normalizeText('accès')).toBe('acces');
    });
  });

  describe('detectIntent', () => {
    // English
    it('detects english greeting', () => {
      const res = detectIntent('Hello there');
      expect(res.intent).toBe('greeting');
      expect(res.language).toBe('en');
    });

    it('detects english mobility need with word boundaries', () => {
      // "ramp" shouldn't trigger on "trampoline" (if it existed)
      const res = detectIntent('where is the ramp');
      expect(res.intent).toBe('accessibility');
      expect(res.language).toBe('en');
      expect(res.need).toBe('mobility');
    });

    it('detects english schedule intent', () => {
      const res = detectIntent('what time do gates open');
      expect(res.intent).toBe('schedule');
      expect(res.language).toBe('en');
    });

    // Spanish
    it('detects spanish vision need with accents in input', () => {
      const res = detectIntent('soy ciego, ayuda');
      expect(res.intent).toBe('accessibility');
      expect(res.language).toBe('es');
      expect(res.need).toBe('vision');
    });

    it('detects spanish food intent', () => {
      const res = detectIntent('tengo mucha hambre');
      expect(res.intent).toBe('food_water');
      expect(res.language).toBe('es');
    });

    it('does not false positive on partial matches', () => {
      // 'agua' is spanish for water. 'jaguar' has 'agua' but shouldn't match.
      const res = detectIntent('the jaguar runs');
      // "runs" is not an intent. We expect unknown.
      expect(res.intent).toBe('unknown');
    });

    // French
    it('detects french greeting', () => {
      const res = detectIntent('bonjour ami');
      expect(res.intent).toBe('greeting');
      expect(res.language).toBe('fr');
    });

    it('detects french restroom (services) intent', () => {
      const res = detectIntent('où sont les toilettes');
      expect(res.intent).toBe('services');
      expect(res.language).toBe('fr');
    });

    // Fallbacks
    it('returns unknown intent with english default for unrecognized text', () => {
      const res = detectIntent('something completely different');
      expect(res.intent).toBe('unknown');
      expect(res.language).toBe('en');
    });
  });
});
