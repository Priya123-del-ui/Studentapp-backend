import { Request, Response } from 'express';
import Class from '../models/Class/Class.models';
import Teacher from '../models/Teacher/Teacher.models';
import Student from '../models/Student/Student.models';

export const createClass = async (req: Request, res: Response) => {
  try {
    const { teacher: teacherId, students: studentIds, ...rest } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: 'One or more students not found' });
    }

    const newClass = new Class({
      teacher: teacherId,
      students: studentIds,
      ...rest,
    });
    await newClass.save();

    // Update teacher's classesTaught
    teacher.classesTaught.push(newClass._id);
    await teacher.save();

    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await Class.find({}).populate('teacher').populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classItem = await Class.findById(id).populate('teacher').populate('students');
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacher: newTeacherId, students: newStudentIds, ...rest } = req.body;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Handle teacher assignment change
    if (newTeacherId && newTeacherId !== classItem.teacher.toString()) {
      const oldTeacher = await Teacher.findById(classItem.teacher);
      if (oldTeacher) {
        oldTeacher.classesTaught = oldTeacher.classesTaught.filter(
          (classId) => classId.toString() !== id
        );
        await oldTeacher.save();
      }

      const newTeacher = await Teacher.findById(newTeacherId);
      if (!newTeacher) {
        return res.status(404).json({ message: 'New teacher not found' });
      }
      newTeacher.classesTaught.push(classItem._id);
      await newTeacher.save();
      classItem.teacher = newTeacherId;
    }

    // Handle student enrollment changes
    if (newStudentIds) {
      const newStudents = await Student.find({ _id: { $in: newStudentIds } });
      if (newStudents.length !== newStudentIds.length) {
        return res.status(404).json({ message: 'One or more new students not found' });
      }
      classItem.students = newStudentIds;
    }

    // Update other fields
    Object.assign(classItem, rest);
    await classItem.save();

    res.json({ message: 'Class updated successfully', class: classItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Remove class from assigned teacher's classesTaught
    const teacher = await Teacher.findById(deletedClass.teacher);
    if (teacher) {
      teacher.classesTaught = teacher.classesTaught.filter(
        (classId) => classId.toString() !== id
      );
      await teacher.save();
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
