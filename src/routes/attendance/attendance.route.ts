import { Router } from 'express';
import { markAttendance, markBulkAttendance } from '../../controllers/attendance.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /attendance/mark:
 *   post:
 *     summary: Mark attendance for a student (Teacher only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *               - deviceFingerprint
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: objectId
 *               classId:
 *                 type: string
 *                 format: objectId
 *               deviceFingerprint:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [present, absent, excused]
 *                 default: present
 *               faceMatchImage:
 *                 type: string
 *               confidenceScore:
 *                 type: number
 *               manualOverride:
 *                 type: boolean
 *               overrideReason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student, Class, Teacher, or Device not found/approved
 */
router.post('/mark', protect, authorize('teacher'), markAttendance);

/**
 * @swagger
 * /attendance/mark-bulk:
 *   post:
 *     summary: Mark attendance for multiple students in a class (Teacher/Admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - deviceFingerprint
 *               - attendanceRecords
 *             properties:
 *               classId:
 *                 type: string
 *                 format: objectId
 *               deviceFingerprint:
 *                 type: string
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       format: objectId
 *                     status:
 *                       type: string
 *                       enum: [present, absent, excused]
 *                     faceMatchImage:
 *                       type: string
 *                     confidenceScore:
 *                       type: number
 *                     manualOverride:
 *                       type: boolean
 *                     overrideReason:
 *                       type: string
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class, Teacher, or Device not found/approved
 */
router.post('/mark-bulk', protect, authorize('teacher', 'admin'), markBulkAttendance);

export default router;
