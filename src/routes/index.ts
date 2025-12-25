import { Router } from 'express';
import authRouter from './auth/auth.route';

const router = Router();

router.get('/health', (_req, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);

export default router;
