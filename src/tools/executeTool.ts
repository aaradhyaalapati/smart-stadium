import { getVenueInfo, findAccessibleServices, getLiveStatus, planVisit } from './venue';
import { Need } from '../types/domain';

export function executeTool(name: string, args: Record<string, any>): any {
  try {
    switch (name) {
      case 'getVenueInfo':
        if (!args['venueId']) return { error: 'Missing venueId' };
        return getVenueInfo(args['venueId']);
      case 'findAccessibleServices':
        if (!args['venueId']) return { error: 'Missing venueId' };
        return findAccessibleServices(args['venueId'], args['need']);
      case 'getLiveStatus':
        if (!args['venueId']) return { error: 'Missing venueId' };
        return getLiveStatus(args['venueId'], args['hour']);
      case 'planVisit':
        if (!args['venueId']) return { error: 'Missing venueId' };
        return planVisit(args['venueId'], args['needs'] as Need[] || [], args['language'] || 'en', args['hour']);
      default:
        return { error: `Unknown tool name: ${name}` };
    }
  } catch (err: any) {
    return { error: `Internal execution error: ${err.message}` };
  }
}
