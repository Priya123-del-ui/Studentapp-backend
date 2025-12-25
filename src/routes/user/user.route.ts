import { Router } from 'express';
import { getMe, updateMe, uploadProfilePhoto } from '../../controllers/user.controller';
import { protect } from '../../middleware/auth.middleware';
import upload from '../../config/multer'; // We will create this file

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

/**
 * @swagger
 * /user/me/photo:
 *   post:
 *     summary: Upload a profile photo for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/me/photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);

export default router;
