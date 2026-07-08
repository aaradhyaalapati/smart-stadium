import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // CSP: Restrict resources to same origin
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Prevent clickjacking via frames
  res.setHeader('X-Frame-Options', 'DENY');
  // Disable intrusive browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
}
