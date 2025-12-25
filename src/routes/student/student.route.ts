import { Router } from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, uploadStudentFaceData } from '../../controllers/student.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import upload from '../../config/multer';

const router = Router();

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rollNumber
 *               - department
 *               - batch
 *             properties:
 *               name:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               department:
 *                 type: string
 *               batch:
 *                 type: string
 *               enrollmentStatus:
 *                 type: string
 *                 enum: [enrolled, graduated, dropped]
 *                 default: enrolled
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', protect, authorize('admin'), createStudent);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of students
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorize('admin'), getStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */
router.get('/:id', protect, authorize('admin'), getStudentById);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student by ID (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               department:
 *                 type: string
 *               batch:
 *                 type: string
 *               enrollmentStatus:
 *                 type: string
 *                 enum: [enrolled, graduated, dropped]
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */
router.put('/:id', protect, authorize('admin'), updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student by ID (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */
router.delete('/:id', protect, authorize('admin'), deleteStudent);

/**
 * @swagger
 * /students/{id}/face-data:
 *   post:
 *     summary: Upload face data for a student (Admin only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               faceImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Face data uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */
router.post('/:id/face-data', protect, authorize('admin'), upload.single('faceImage'), uploadStudentFaceData);

export default router;
