import { Router } from 'express';
import { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher, updateMeTeacher } from '../../controllers/teacher.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher (Admin only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - department
 *             properties:
 *               userId:
 *                 type: string
 *                 format: objectId
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', protect, authorize('admin'), createTeacher);

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers (Admin only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of teachers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorize('admin'), getTeachers);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID (Admin only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: Teacher data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Teacher not found
 */
router.get('/:id', protect, authorize('admin'), getTeacherById);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher by ID (Admin only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Teacher not found
 */
router.put('/:id', protect, authorize('admin'), updateTeacher);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher by ID (Admin only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Teacher not found
 */
router.delete('/:id', protect, authorize('admin'), deleteTeacher);

/**
 * @swagger
 * /teachers/me:
 *   put:
 *     summary: Update the authenticated teacher's profile (Teacher only)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher profile updated successfully
 *       400:
 *         description: Bad request (e.g., invalid input)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if attempting to update restricted fields)
 */
router.put('/me', protect, authorize('teacher', 'admin'), updateMeTeacher);

export default router;
