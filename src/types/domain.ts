export type Need = 'mobility' | 'vision' | 'hearing' | 'sensory' | 'general';

export interface AccessibilityServices {
  sensoryRoom: boolean;
  assistiveListening: boolean;
  visionSupport: boolean;
  elevators: boolean;
  accessibleRestrooms: boolean;
  verified: boolean;
}

export interface GeneralServices {
  water: boolean;
  firstAid: boolean;
  nursingRoom: boolean;
  prayerRoom: boolean;
}

export interface Gate {
  name: string;
  accessible: boolean;
  notes?: string;
}

export interface MatchdayInfo {
  match?: string;
  kickoffTime?: string;
  gatesOpen?: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  gates: Gate[];
  accessibilityServices: AccessibilityServices;
  generalServices: GeneralServices;
  matchdayInfo?: MatchdayInfo;
}

export interface LiveStatus {
  venueId: string;
  timestamp: string;
  crowdLevel: 'low' | 'moderate' | 'busy' | 'full';
  estimatedWaitMinutes: number;
  simulated: boolean;
}

export interface VisitPlan {
  venueId: string;
  language: string;
  recommendedGates: Gate[];
  relevantServices: string[];
  status: LiveStatus;
}
