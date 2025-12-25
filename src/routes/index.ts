import { Router } from 'express';
import authRouter from './auth/auth.route';
import userRouter from './user/user.route';
import studentRouter from './student/student.route';
import teacherRouter from './teacher/teacher.route';
import deviceRouter from './device/device.route';
import classRouter from './class/class.route';

const router = Router();

router.get('/health', (_req, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/students', studentRouter);
router.use('/teachers', teacherRouter);
router.use('/devices', deviceRouter);
router.use('/classes', classRouter);

export default router;
