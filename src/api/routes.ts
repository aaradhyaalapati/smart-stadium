import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ChatRequestSchema } from './schemas';
import { answer } from '../assistant';
import { listVenues, getVenue } from '../data/venues';
import { enforceRateLimit } from '../middleware/rateLimit';

export const apiRouter = Router();

apiRouter.get('/healthz', (req: Request, res: Response) => {
  const mode = process.env.GEMINI_API_KEY ? 'live' : 'offline';
  res.json({ status: 'ok', llm: mode });
});

apiRouter.get('/venues', (req: Request, res: Response) => {
  res.json(listVenues());
});

apiRouter.get('/venues/search', (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q) {
    return res.json([]);
  }
  const query = q.toLowerCase();
  const results = listVenues().filter(v => v.name.toLowerCase().includes(query) || v.city.toLowerCase().includes(query) || v.country.toLowerCase().includes(query));
  res.json(results);
});

apiRouter.get('/venues/:id', (req: Request, res: Response) => {
  const venueId = req.params.id as string;
  const venue = getVenue(venueId);
  if (!venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }
  res.json(venue);
});

apiRouter.post('/chat', enforceRateLimit, async (req: Request, res: Response) => {
  try {
    const parsed = ChatRequestSchema.parse(req.body);
    const result = await answer(parsed.message, parsed.profile as any, parsed.history as any);
    res.json({
      reply: result.answer,
      mode: result.mode,
      venueId: parsed.profile.venueId
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const details = err.issues.map((e: any) => `${e.path?.length ? e.path.join('.') : 'unknown'}: ${e.message}`);
      return res.status(400).json({ error: 'Invalid request payload', details });
    }
    if (err && Array.isArray(err.errors)) {
      const details = err.errors.map((e: any) => `${e.path?.length ? e.path.join('.') : 'unknown'}: ${e.message}`);
      return res.status(400).json({ error: 'Invalid request payload', details });
    }
    // Any other error (e.g. 400 from our own backend we purposely re-raised)
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});
