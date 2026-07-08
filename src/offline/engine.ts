import { detectIntent, SupportedLanguage } from './intents';
import { renderTemplate } from './templates';
import { executeTool } from '../tools/executeTool';
import { Need } from '../types/domain';
import { listVenues } from '../data/venues';

export interface UserProfile {
  language?: SupportedLanguage;
  needs?: Need[];
  venueId?: string;
}

export function offlineAnswer(message: string, profile: UserProfile): string {
  try {
    const detection = detectIntent(message);
    
    // Language priority: Profile > Detected
    const language = profile.language || detection.language;
    
    // Need priority: Detected from keyword > Profile > general
    const primaryProfileNeed = (profile.needs && profile.needs.length > 0) ? profile.needs[0] : 'general';
    const need = detection.need || primaryProfileNeed;

    // Handle intents that do not require a venue
    if (detection.intent === 'greeting' || detection.intent === 'unknown') {
      return renderTemplate(language, detection.intent);
    }

    // Require venue for venue-specific intents
    if (!profile.venueId) {
      const venues = listVenues();
      const exampleNames = venues.slice(0, 2).map(v => v.name).join(' or ');
      return renderTemplate(language, 'missing_venue', { exampleVenues: exampleNames });
    }

    const venueId = profile.venueId;

    switch (detection.intent) {
      case 'accessibility': {
        const result = executeTool('findAccessibleServices', { venueId, need });
        if (result.error) return renderTemplate(language, 'error', { error: result.error });
        
        // Flatten services to string for template
        const acc = result.services.accessibility;
        const availableAcc = Object.keys(acc).filter(k => acc[k as keyof typeof acc]).join(', ');
        
        return renderTemplate(language, 'accessibility', {
          venue: venueId, // Should use venue name, but keeping simple for string replacement if venue info fetched
          need: result.need,
          note: result.note || '',
          services: availableAcc || 'None available'
        });
      }
      case 'services': {
        const result = executeTool('findAccessibleServices', { venueId, need: 'general' });
        if (result.error) return renderTemplate(language, 'error', { error: result.error });
        
        const gen = result.services.general;
        const availableGen = Object.keys(gen).filter(k => gen[k as keyof typeof gen]).join(', ');
        
        return renderTemplate(language, 'services', {
          venue: venueId,
          services: availableGen || 'None available'
        });
      }
      case 'food_water': {
        const result = executeTool('findAccessibleServices', { venueId, need: 'general' });
        if (result.error) return renderTemplate(language, 'error', { error: result.error });
        
        return renderTemplate(language, 'food_water', {
          venue: venueId,
          water_status: result.services.general.water ? 'available' : 'not available'
        });
      }
      case 'schedule': {
        const result = executeTool('getVenueInfo', { venueId });
        if (result.error) return renderTemplate(language, 'error', { error: result.error });
        
        const info = result.matchdayInfo || {};
        return renderTemplate(language, 'schedule', {
          venue: result.name,
          match: info.match || 'TBA',
          gatesOpen: info.gatesOpen || 'TBA',
          kickoffTime: info.kickoffTime || 'TBA'
        });
      }
      case 'navigation': {
        const result = executeTool('planVisit', { venueId, needs: [need], language });
        if (result.error) return renderTemplate(language, 'error', { error: result.error });
        
        const gates = result.recommendedGates.map((g: any) => g.name).join(' and ');
        
        return renderTemplate(language, 'navigation', {
          venue: venueId,
          crowdLevel: result.status.crowdLevel,
          waitMinutes: result.status.estimatedWaitMinutes,
          gates: gates || 'No accessible gates listed'
        });
      }
      default:
        return renderTemplate(language, 'unknown');
    }
  } catch (err: any) {
    // If the template throws due to unrendered placeholders or internal failure
    return renderTemplate(profile.language || 'en', 'error', { error: err.message });
  }
}
