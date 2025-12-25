import { Router } from 'express';
import { getMe } from '../../controllers/user.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get the user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

export default router;
