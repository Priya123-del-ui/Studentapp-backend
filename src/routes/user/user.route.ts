import { Router } from 'express';
import { getMe, updateMe } from '../../controllers/user.controller';
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

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin]
 *               # Add other updateable fields here, e.g., name, phone, etc.
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad request (e.g., invalid input)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if attempting to update restricted fields)
 */
router.put('/me', protect, updateMe);

export default router;
