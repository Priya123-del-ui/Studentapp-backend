import { Request, Response } from 'express';
import Student from '../models/Student/Student.models';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    const { rollNumber, department, batch } = req.query;

    if (rollNumber) {
      query.rollNumber = rollNumber;
    }

    if (department) {
      query.department = department;
    }

    if (batch) {
      query.batch = batch;
    }

    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enrollmentStatus, ...rest } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate enrollmentStatus
    if (enrollmentStatus && !['enrolled', 'graduated', 'dropped'].includes(enrollmentStatus)) {
      return res.status(400).json({ message: 'Invalid enrollment status' });
    }

    // Update student fields
    Object.assign(student, rest);
    if (enrollmentStatus) {
      student.enrollmentStatus = enrollmentStatus;
    }

    await student.save();

    res.json({ message: 'Student updated successfully', student: student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const uploadStudentFaceData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.faceData.push(`/uploads/${req.file.filename}`);
    await student.save();

    res.json({ message: 'Face data uploaded successfully', faceData: student.faceData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
