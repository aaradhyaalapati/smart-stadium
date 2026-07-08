import { listVenues, getVenue, searchVenues } from './venues';

describe('venues data layer', () => {
  it('listVenues returns all venues safely cloned', () => {
    const venues = listVenues();
    expect(venues.length).toBeGreaterThan(0);
    // Mutation test
    venues[0]!.name = 'Mutated';
    expect(listVenues()[0]?.name).not.toBe('Mutated');
  });

  it('getVenue returns a known venue', () => {
    const venue = getVenue('v-metlife');
    expect(venue).toBeDefined();
    expect(venue?.id).toBe('v-metlife');
    
    // Mutation test
    venue!.name = 'Mutated 2';
    expect(getVenue('v-metlife')?.name).not.toBe('Mutated 2');
  });

  it('getVenue returns undefined for unknown id', () => {
    expect(getVenue('unknown')).toBeUndefined();
  });

  it('searchVenues matches by name or city (case-insensitive)', () => {
    const nameMatch = searchVenues('metlife');
    expect(nameMatch.length).toBe(1);
    expect(nameMatch[0]?.id).toBe('v-metlife');

    const cityMatch = searchVenues('mexico');
    expect(cityMatch.length).toBe(1);
    expect(cityMatch[0]?.id).toBe('v-azteca');
  });

  it('searchVenues returns all for empty query', () => {
    const emptyMatch = searchVenues('');
    const spaceMatch = searchVenues('   ');
    const all = listVenues();
    expect(emptyMatch.length).toBe(all.length);
    expect(spaceMatch.length).toBe(all.length);
  });
});
