import { Router } from 'express';
import authRouter from './auth/auth.route';
import userRouter from './user/user.route';

const router = Router();

router.get('/health', (_req, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);
router.use('/user', userRouter);

export default router;
