import Student from '../models/Student/Student.models';
import AppError from '../utils/appError';
import logger from '../utils/logger'; // Import the logger utility

class StudentService {
  async createStudent(studentData: any): Promise<any> {
    const { name, rollNumber, department, batch } = studentData;

    if (!name || !rollNumber || !department || !batch) {
      logger.warn('Student creation failed: Missing required fields.');
      throw new AppError('Missing required fields: name, rollNumber, department, batch', 400);
    }

    const newStudent = new Student(studentData);
    await newStudent.save();
    logger.info(`Student created successfully: ${newStudent.id} - ${newStudent.name}`);
    return { message: 'Student created successfully', student: newStudent };
  }

  async getStudents(query: any): Promise<any> {
    const students = await Student.find(query);
    logger.info(`Retrieved ${students.length} student(s) with query: ${JSON.stringify(query)}`);
    return students;
  }

  async getStudentById(studentId: string): Promise<any> {
    const student = await Student.findById(studentId);
    if (!student) {
      logger.warn(`Attempted to retrieve non-existent student with ID: ${studentId}`);
      throw new AppError('Student not found', 404);
    }
    logger.info(`Retrieved student with ID: ${studentId} - ${student.name}`);
    return student;
  }

  async updateStudent(studentId: string, profileData: any): Promise<any> {
    const { enrollmentStatus, ...rest } = profileData;

    const student = await Student.findById(studentId);
    if (!student) {
      logger.warn(`Attempted to update non-existent student with ID: ${studentId}`);
      throw new AppError('Student not found', 404);
    }

    // Validate enrollmentStatus
    if (enrollmentStatus && !['enrolled', 'graduated', 'dropped'].includes(enrollmentStatus)) {
      logger.warn(`Invalid enrollment status '${enrollmentStatus}' for student ID: ${studentId}`);
      throw new AppError('Invalid enrollment status', 400);
    }

    // Update student fields
    Object.assign(student, rest);
    if (enrollmentStatus) {
      student.enrollmentStatus = enrollmentStatus;
    }

    await student.save();
    logger.info(`Student updated successfully: ${student.id} - ${student.name}`);
    return { message: 'Profile updated successfully', student: student };
  }

  async deleteStudent(studentId: string): Promise<any> {
    const deletedStudent = await Student.findByIdAndDelete(studentId);
    if (!deletedStudent) {
      logger.warn(`Attempted to delete non-existent student with ID: ${studentId}`);
      throw new AppError('Student not found', 404);
    }
    logger.info(`Student deleted successfully: ${studentId}`);
    return { message: 'Student deleted successfully' };
  }

  async uploadFaceData(studentId: string, filePath: string): Promise<any> {
    const student = await Student.findById(studentId);
    if (!student) {
      logger.warn(`Face data upload failed: Student with ID ${studentId} not found.`);
      throw new AppError(`Student with ID ${studentId} not found.`, 404);
    }

    if (!student.faceData) {
        student.faceData = []; // Initialize if not present
    }
    student.faceData.push(filePath);
    await student.save();
    logger.info(`Face data uploaded for student ${studentId}: ${filePath}`);
    return { message: 'Face data uploaded successfully', faceData: student.faceData };
  }

  async enrollStudent(studentId: string, courseId: string): Promise<any> {
    // TODO: Implement logic to enroll student in a course (requires Course model interaction)
    // For now, it's a placeholder
    logger.info(`Student enrollment attempt: Student ${studentId} in course ${courseId} (mock)`);
    console.log('Enrolling student', studentId, 'in course', courseId);
    return { message: 'Student enrolled successfully (mock)' };
  }

  async unenrollStudent(studentId: string, courseId: string): Promise<any> {
    // TODO: Implement logic to unenroll student from a course (requires Course model interaction)
    // For now, it's a placeholder
    logger.info(`Student unenrollment attempt: Student ${studentId} from course ${courseId} (mock)`);
    console.log('Unenrolling student', studentId, 'from course', courseId);
    return { message: 'Student unenrolled successfully (mock)' };
  }
}

export default StudentService;


