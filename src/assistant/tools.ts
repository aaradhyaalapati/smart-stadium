import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const assistantTools: FunctionDeclaration[] = [
  {
    name: 'getVenueInfo',
    description: 'Use this tool ONLY when you need general information about a venue, such as its name, city, country, or overall capacity. Do not use this for real-time status or accessible services.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        venueId: {
          type: SchemaType.STRING,
          description: 'The unique identifier of the venue.'
        }
      },
      required: ['venueId']
    }
  },
  {
    name: 'findAccessibleServices',
    description: 'Use this tool when the user asks about specific services (e.g., restrooms, first aid) or accessibility features (e.g., elevators, sensory rooms, ramps) at a venue. Must be called before suggesting services.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        venueId: {
          type: SchemaType.STRING,
          description: 'The unique identifier of the venue.'
        },
        need: {
          type: SchemaType.STRING,
          description: "The specific accessibility need: 'mobility', 'vision', 'hearing', 'sensory', or 'general'."
        }
      },
      required: ['venueId', 'need']
    }
  },
  {
    name: 'getLiveStatus',
    description: 'Use this tool ONLY when the user asks for real-time crowd levels, wait times, or congestion at a venue. Do not guess these values without calling this tool.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        venueId: {
          type: SchemaType.STRING,
          description: 'The unique identifier of the venue.'
        },
        hour: {
          type: SchemaType.NUMBER,
          description: 'The hour of the day (0-23) to check the status for. Omit to use the current time.'
        }
      },
      required: ['venueId']
    }
  },
  {
    name: 'planVisit',
    description: 'Use this tool when the user needs recommendations for accessible gates, relevant services, and navigation help combined with live status for a comprehensive visit plan.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        venueId: {
          type: SchemaType.STRING,
          description: 'The unique identifier of the venue.'
        },
        needs: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING
          },
          description: "List of accessibility needs: 'mobility', 'vision', 'hearing', 'sensory', or 'general'."
        },
        language: {
          type: SchemaType.STRING,
          description: "The two-letter language code (e.g., 'en', 'es', 'fr') for localized results."
        },
        hour: {
          type: SchemaType.NUMBER,
          description: 'The hour of the day (0-23) for the visit plan. Omit to use current time.'
        }
      },
      required: ['venueId', 'needs', 'language']
    }
  }
];
