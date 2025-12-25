import { Router } from 'express';
import { registerDevice } from '../../controllers/device.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /devices/register:
 *   post:
 *     summary: Register a new device (Teacher only)
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fingerprint
 *             properties:
 *               fingerprint:
 *                 type: string
 *                 description: Unique identifier for the device
 *     responses:
 *       201:
 *         description: Device registered successfully with pending status
 *       400:
 *         description: Bad request (e.g., missing fingerprint, duplicate fingerprint)
 *       401:
 *         description: Unauthorized
 */
router.post('/register', protect, registerDevice);

export default router;
