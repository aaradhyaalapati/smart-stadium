import { Venue, Need, LiveStatus, VisitPlan } from '../types/domain';
import { getVenue } from '../data/venues';

// Simple deterministic PRNG: Mulberry32
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Helper to hash string to number for PRNG seed
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1^h2^h3^h4) >>> 0;
}

export function getVenueInfo(venueId: string): Venue | { error: string } {
  const venue = getVenue(venueId);
  if (!venue) {
    return { error: `Venue not found for id: ${venueId}` };
  }
  return venue;
}

export function findAccessibleServices(venueId: string, need: string): any {
  const venue = getVenue(venueId);
  if (!venue) {
    return { error: `Venue not found for id: ${venueId}` };
  }

  // Normalize need, fallback to general
  const validNeeds: Need[] = ['mobility', 'vision', 'hearing', 'sensory', 'general'];
  const normalizedNeed: Need = validNeeds.includes(need as Need) ? (need as Need) : 'general';

  let note = '';
  if (normalizedNeed !== need) {
    note = `Note: Unknown need '${need}' normalized to 'general'.`;
  }

  const { accessibilityServices, generalServices } = venue;
  
  return {
    venueId,
    need: normalizedNeed,
    note: note || undefined,
    services: {
      accessibility: accessibilityServices,
      general: generalServices
    }
  };
}

export function getLiveStatus(venueId: string, hour?: number): LiveStatus | { error: string } {
  const venue = getVenue(venueId);
  if (!venue) {
    return { error: `Venue not found for id: ${venueId}` };
  }

  const resolvedHour = hour ?? new Date().getHours();
  const seedString = `${venueId}-${resolvedHour}`;
  const seed = cyrb128(seedString);
  const rand = mulberry32(seed);
  
  const levels: Array<'low' | 'moderate' | 'busy' | 'full'> = ['low', 'moderate', 'busy', 'full'];
  const levelIndex = Math.floor(rand() * levels.length);
  const waitMinutes = Math.floor(rand() * 45); // 0 to 44

  return {
    venueId,
    timestamp: new Date().toISOString(),
    crowdLevel: levels[levelIndex]!,
    estimatedWaitMinutes: waitMinutes,
    simulated: true
  };
}

export function planVisit(venueId: string, needs: Need[], language: string, hour?: number): VisitPlan | { error: string } {
  const venue = getVenue(venueId);
  if (!venue) {
    return { error: `Venue not found for id: ${venueId}` };
  }

  const statusResult = getLiveStatus(venueId, hour);
  if ('error' in statusResult) {
    return statusResult;
  }

  const accessibleGates = venue.gates.filter(g => g.accessible);

  return {
    venueId,
    language,
    recommendedGates: accessibleGates,
    relevantServices: ['Customer Service', 'Information Desk'], // Static placeholder list of relevant services for now
    status: statusResult as LiveStatus
  };
}
