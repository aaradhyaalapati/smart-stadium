import { Venue } from '../types/domain';
import venuesData from '../../data/venues.json';

// Load-once-cache pattern (module-level singleton)
let cachedVenues: Venue[] | null = null;

function loadVenues(): Venue[] {
  if (!cachedVenues) {
    cachedVenues = venuesData as Venue[];
  }
  return cachedVenues;
}

// Deep clone utility to prevent mutation of cached data
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function listVenues(): Venue[] {
  return clone(loadVenues());
}

export function getVenue(id: string): Venue | undefined {
  const venues = loadVenues();
  const venue = venues.find((v) => v.id === id);
  return venue ? clone(venue) : undefined;
}

export function searchVenues(query: string): Venue[] {
  if (!query.trim()) return listVenues();
  
  const q = query.toLowerCase();
  const venues = loadVenues();
  return clone(venues.filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)));
}
