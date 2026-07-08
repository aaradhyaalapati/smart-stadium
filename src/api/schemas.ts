import { z } from 'zod';

export const ContentPartSchema = z.object({
  text: z.string().optional(),
  functionCall: z.object({
    name: z.string(),
    args: z.record(z.string(), z.any())
  }).optional(),
  functionResponse: z.object({
    name: z.string(),
    response: z.record(z.string(), z.any())
  }).optional()
}).strict();

export const ContentSchema = z.object({
  role: z.string(),
  parts: z.array(ContentPartSchema)
}).strict();

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000).transform(s => s.trim()),
  profile: z.object({
    language: z.string().optional(),
    needs: z.array(z.string()).optional(),
    venueId: z.string().optional()
  }).strict(),
  history: z.array(ContentSchema).max(20).optional()
}).strict(); // strict() rejects unknown fields, mitigating prototype pollution
