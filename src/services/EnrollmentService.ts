import Enrollment from '../models/Enrollment/Enrollment.models';
import Student from '../models/Student/Student.models'; // Assuming Student model exists
import Course from '../models/Course/Course.models'; // Assuming Course model exists
import AppError from '../utils/appError';
import logger from '../utils/logger';

class EnrollmentService {
  async createEnrollment(studentId: string, courseId: string): Promise<any> {
    // Validate if student and course exist
    const student = await Student.findById(studentId);
    if (!student) {
      logger.warn(`Enrollment failed: Student with ID ${studentId} not found.`);
      throw new AppError(`Student with ID ${studentId} not found.`, 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      logger.warn(`Enrollment failed: Course with ID ${courseId} not found.`);
      throw new AppError(`Course with ID ${courseId} not found.`, 404);
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      logger.warn(`Enrollment failed: Student ${studentId} is already enrolled in course ${courseId}.`);
      throw new AppError(`Student ${studentId} is already enrolled in course ${courseId}.`, 400);
    }

    const newEnrollment = new Enrollment({ student: studentId, course: courseId });
    await newEnrollment.save();
    logger.info(`Enrollment created: Student ${studentId} enrolled in Course ${courseId}.`);
    return newEnrollment;
  }

  async getEnrollmentById(enrollmentId: string): Promise<any> {
    const enrollment = await Enrollment.findById(enrollmentId).populate('student').populate('course');
    if (!enrollment) {
      logger.warn(`Enrollment not found with ID: ${enrollmentId}`);
      throw new AppError(`Enrollment not found with ID: ${enrollmentId}`, 404);
    }
    logger.info(`Retrieved enrollment with ID: ${enrollmentId}`);
    return enrollment;
  }

  async getEnrollmentsByStudent(studentId: string): Promise<any[]> {
    const enrollments = await Enrollment.find({ student: studentId }).populate('course');
    logger.info(`Retrieved ${enrollments.length} enrollments for student ID: ${studentId}`);
    return enrollments;
  }

  async getEnrollmentsByCourse(courseId: string): Promise<any[]> {
    const enrollments = await Enrollment.find({ course: courseId }).populate('student');
    logger.info(`Retrieved ${enrollments.length} enrollments for course ID: ${courseId}`);
    return enrollments;
  }

  async updateEnrollmentStatus(enrollmentId: string, newStatus: 'enrolled' | 'completed' | 'dropped'): Promise<any> {
    if (!['enrolled', 'completed', 'dropped'].includes(newStatus)) {
      logger.warn(`Invalid enrollment status provided: ${newStatus} for enrollment ID: ${enrollmentId}`);
      throw new AppError('Invalid enrollment status provided.', 400);
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status: newStatus },
      { new: true, runValidators: true }
    );
    if (!enrollment) {
      logger.warn(`Enrollment not found for update with ID: ${enrollmentId}`);
      throw new AppError(`Enrollment not found with ID: ${enrollmentId}`, 404);
    }
    logger.info(`Enrollment ID ${enrollmentId} status updated to: ${newStatus}`);
    return enrollment;
  }

  async deleteEnrollment(enrollmentId: string): Promise<string> {
    const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);
    if (!deletedEnrollment) {
      logger.warn(`Enrollment not found for deletion with ID: ${enrollmentId}`);
      throw new AppError(`Enrollment not found with ID: ${enrollmentId}`, 404);
    }
    logger.info(`Enrollment ID ${enrollmentId} deleted successfully.`);
    return 'Enrollment deleted successfully.';
  }
}

export default EnrollmentService;
