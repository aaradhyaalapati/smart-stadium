import { getVenueInfo, findAccessibleServices, getLiveStatus, planVisit } from './venue';
import { executeTool } from './executeTool';
import { LiveStatus, VisitPlan } from '../types/domain';

describe('tools layer', () => {
  describe('getVenueInfo', () => {
    it('returns venue for known id', () => {
      const res = getVenueInfo('v-metlife');
      expect('error' in res).toBe(false);
      expect((res as any).id).toBe('v-metlife');
    });

    it('returns error for unknown id', () => {
      const res = getVenueInfo('unknown');
      expect(res).toEqual({ error: 'Venue not found for id: unknown' });
    });
  });

  describe('findAccessibleServices', () => {
    it('returns services for known venue and valid need', () => {
      const res = findAccessibleServices('v-metlife', 'mobility');
      expect(res.error).toBeUndefined();
      expect(res.need).toBe('mobility');
      expect(res.note).toBeUndefined();
    });

    it('normalizes invalid need to general and adds a note', () => {
      const res = findAccessibleServices('v-metlife', 'invalid_need');
      expect(res.error).toBeUndefined();
      expect(res.need).toBe('general');
      expect(res.note).toContain("Unknown need 'invalid_need' normalized to 'general'");
    });

    it('returns error for unknown venue', () => {
      const res = findAccessibleServices('unknown', 'mobility');
      expect(res).toEqual({ error: 'Venue not found for id: unknown' });
    });
  });

  describe('getLiveStatus', () => {
    it('is deterministic for same venue and hour', () => {
      const res1 = getLiveStatus('v-metlife', 14) as LiveStatus;
      const res2 = getLiveStatus('v-metlife', 14) as LiveStatus;
      
      // Timestamp might be slightly different since we use Date.now() in the function,
      // but waitMinutes and crowdLevel must be identical.
      expect(res1.crowdLevel).toBe(res2.crowdLevel);
      expect(res1.estimatedWaitMinutes).toBe(res2.estimatedWaitMinutes);
      expect(res1.simulated).toBe(true);
    });

    it('returns error for unknown venue', () => {
      const res = getLiveStatus('unknown', 14);
      expect(res).toEqual({ error: 'Venue not found for id: unknown' });
    });

    it('uses current hour if none provided', () => {
      const res = getLiveStatus('v-metlife');
      expect('error' in res).toBe(false);
      expect((res as LiveStatus).simulated).toBe(true);
    });
  });

  describe('planVisit', () => {
    it('returns a visit plan for known venue', () => {
      const res = planVisit('v-metlife', ['mobility'], 'en', 14);
      expect('error' in res).toBe(false);
      expect((res as any).venueId).toBe('v-metlife');
      expect((res as any).language).toBe('en');
      expect((res as any).recommendedGates.length).toBeGreaterThan(0);
    });

    it('returns error for unknown venue', () => {
      const res = planVisit('unknown', [], 'en', 14);
      expect(res).toEqual({ error: 'Venue not found for id: unknown' });
    });

    it('returns error if getLiveStatus fails', () => {
      const venuesData = require('../data/venues');
      jest.spyOn(venuesData, 'getVenue')
        .mockReturnValueOnce({ id: 'v-metlife', gates: [], accessibilityServices: {} as any, generalServices: {} as any, name: 'x', city: 'x', country: 'x', capacity: 1 })
        .mockReturnValueOnce(undefined);
      
      const res = planVisit('v-metlife', [], 'en', 14);
      expect(res).toEqual({ error: 'Venue not found for id: v-metlife' });
      jest.restoreAllMocks();
    });
  });

  describe('executeTool dispatcher', () => {
    it('executes known tools safely', () => {
      const res = executeTool('getVenueInfo', { venueId: 'v-metlife' });
      expect(res.id).toBe('v-metlife');
    });

    it('returns error for missing venueId where required', () => {
      const res = executeTool('getVenueInfo', {});
      expect(res).toEqual({ error: 'Missing venueId' });
    });

    it('returns error for unknown tools', () => {
      const res = executeTool('unknownTool', {});
      expect(res).toEqual({ error: 'Unknown tool name: unknownTool' });
    });

    it('catches and returns internal errors safely without throwing', () => {
      // simulate an error by passing bad arguments if we can, or we know unknown tool is handled
      // to test the catch block, we could pass null args if we didn't type check
      // We'll mock planVisit to throw internally just to test dispatcher wrapper
      jest.spyOn(require('./venue'), 'planVisit').mockImplementation(() => {
        throw new Error('Mock exception');
      });
      const res = executeTool('planVisit', { venueId: 'v-metlife' });
      expect(res.error).toContain('Internal execution error: Mock exception');
      jest.restoreAllMocks();
    });
    
    it('handles other tools missing venueId', () => {
      expect(executeTool('findAccessibleServices', {})).toEqual({ error: 'Missing venueId' });
      expect(executeTool('getLiveStatus', {})).toEqual({ error: 'Missing venueId' });
      expect(executeTool('planVisit', {})).toEqual({ error: 'Missing venueId' });
    });

    it('executes all tools with valid arguments', () => {
      expect(executeTool('findAccessibleServices', { venueId: 'v-metlife', need: 'mobility' }).venueId).toBe('v-metlife');
      expect((executeTool('getLiveStatus', { venueId: 'v-metlife' }) as LiveStatus).simulated).toBe(true);
      expect((executeTool('planVisit', { venueId: 'v-metlife' }) as VisitPlan).venueId).toBe('v-metlife');
    });
  });
});
