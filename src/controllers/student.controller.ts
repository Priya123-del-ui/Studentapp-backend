import { Request, Response } from 'express';
import StudentService from '../services/StudentService'; // Import StudentService
import AppError from '../utils/appError'; // Import AppError

const studentService = new StudentService(); // Create an instance of StudentService

export const createStudent = async (req: Request, res: Response) => {
  try {
    const result = await studentService.createStudent(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
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

    const students = await studentService.getStudents(query);
    res.json(students);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await studentService.updateStudent(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await studentService.deleteStudent(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error', error });
  }
};

export const uploadStudentFaceData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await studentService.uploadFaceData(id, `/uploads/${req.file.filename}`);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: 'Server error', error });
  }
};
