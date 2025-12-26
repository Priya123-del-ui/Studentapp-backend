import { Router } from 'express';
import { registerDevice, approveDevice, rejectDevice, revokeDevice, getDevices, getDeviceById, updateDevice, deleteDevice } from '../../controllers/device.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Routes for all devices (Admin only)
router.route('/')
  .get(protect, authorize('admin'), getDevices); // Get all devices

// Routes for specific device by ID (Admin only for GET, PUT, DELETE)
router.route('/:id')
  .get(protect, authorize('admin'), getDeviceById) // Get device by ID
  .put(protect, authorize('admin'), updateDevice) // Update device by ID (general update)
  .delete(protect, authorize('admin'), deleteDevice); // Delete device by ID

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
router.post('/register', protect, registerDevice); // Accessible by authenticated teachers

/**
 * @swagger
 * /devices/{id}/approve:
 *   put:
 *     summary: Approve a pending device (Admin only)
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The device ID
 *     responses:
 *       200:
 *         description: Device approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Device not found
 *       400:
 *         description: Device is not pending or teacher already has an approved device
 */
router.put('/:id/approve', protect, authorize('admin'), approveDevice);

/**
 * @swagger
 * /devices/{id}/reject:
 *   put:
 *     summary: Reject a pending device (Admin only)
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The device ID
 *     responses:
 *       200:
 *         description: Device rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Device not found
 *       400:
 *         description: Device is not pending
 */
router.put('/:id/reject', protect, authorize('admin'), rejectDevice);

/**
 * @swagger
 * /devices/{id}/revoke:
 *   put:
 *     summary: Revoke an approved device (Admin only)
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The device ID
 *     responses:
 *       200:
 *         description: Device revoked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Device not found
 *       400:
 *         description: Device is not approved
 */
router.put('/:id/revoke', protect, authorize('admin'), revokeDevice);

export default router;

