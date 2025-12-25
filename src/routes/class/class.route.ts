import { Router } from 'express';
import { createClass, getClasses, getClassById, updateClass, deleteClass } from '../../controllers/class.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class (Admin only)
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseCode
 *               - name
 *               - teacher
 *               - students
 *               - schedule
 *             properties:
 *               courseCode:
 *                 type: string
 *               name:
 *                 type: string
 *               teacher:
 *                 type: string
 *                 format: objectId
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', protect, authorize('admin'), createClass);

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes (Admin only)
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of classes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorize('admin'), getClasses);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Get a class by ID (Admin only)
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The class ID
 *     responses:
 *       200:
 *         description: Class data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 */
router.get('/:id', protect, authorize('admin'), getClassById);

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Update a class by ID (Admin only)
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *               name:
 *                 type: string
 *               teacher:
 *                 type: string
 *                 format: objectId
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 */
router.put('/:id', protect, authorize('admin'), updateClass);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Delete a class by ID (Admin only)
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 */
router.delete('/:id', protect, authorize('admin'), deleteClass);

export default router;
