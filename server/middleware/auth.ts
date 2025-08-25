import express from 'express';

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};