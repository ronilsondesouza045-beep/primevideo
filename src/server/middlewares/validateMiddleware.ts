import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues.map((e) => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ error: 'Erro de validação' });
    }
  };
};
