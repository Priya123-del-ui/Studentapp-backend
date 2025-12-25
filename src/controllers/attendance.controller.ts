import { Request, Response } from 'express';
import Attendance from '../models/Attendance/Attendance.models';
import Student from '../models/Student/Student.models';
import Class from '../models/Class/Class.models';
import Device from '../models/Device/Device.models';
import User from '../models/Users/Users.models';
import Teacher from '../models/Teacher/Teacher.models';

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, classId, deviceFingerprint, status = 'present', faceMatchImage, confidenceScore, manualOverride = false, overrideReason } = req.body;
    const markedByUserId = (req as any).user.id;

    // 1. Verify Teacher Identity
    const markedByUser = await User.findById(markedByUserId);
    if (!markedByUser || !['teacher', 'admin'].includes(markedByUser.role)) {
      return res.status(403).json({ message: 'Only teachers and admins can mark attendance' });
    }

    const teacher = await Teacher.findOne({ userId: markedByUserId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found for this user' });
    }

    // 2. Verify Device Approval Status
    const device = await Device.findOne({ fingerprint: deviceFingerprint, teacherId: teacher._id });
    if (!device) {
      return res.status(404).json({ message: 'Device not found or does not belong to this teacher' });
    }
    if (device.status !== 'approved') {
      return res.status(403).json({ message: 'Device is not approved for attendance marking' });
    }

    // Update lastUsedAt for the device
    device.lastUsedAt = new Date();
    await device.save();

    // 3. Verify Student and Class existence
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // 4. Attendance Validation: Check if student is enrolled in the class
    if (!classItem.students.includes(student._id)) {
        return res.status(400).json({ message: 'Student is not enrolled in this class' });
    }

    // 5. Duplicate Prevention (same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      student: studentId,
      class: classId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this student in this class today' });
    }

    // 6. Face Recognition (Placeholder)
    // In a real application, faceMatchImage would be sent to a face recognition service
    // and confidenceScore would be returned. For now, we'll just store the image path.
    let finalConfidenceScore = confidenceScore;
    if (faceMatchImage && !finalConfidenceScore) {
      // Simulate a confidence score if image is provided but score isn't
      finalConfidenceScore = Math.random() * (1 - 0.7) + 0.7; // Random score between 0.7 and 1
    }


    const newAttendance = new Attendance({
      student: studentId,
      class: classId,
      date: new Date(),
      status,
      markedBy: markedByUser._id,
      device: device._id,
      confidenceScore: finalConfidenceScore,
      faceMatchImage: faceMatchImage ? `/uploads/${faceMatchImage}` : undefined, // Assuming image is uploaded and path is passed
      manualOverride,
      overrideReason,
    });

    await newAttendance.save();

    res.status(201).json({ message: 'Attendance marked successfully', attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const { classId, deviceFingerprint, attendanceRecords } = req.body;
    const markedByUserId = (req as any).user.id;

    // 1. Verify Teacher/Admin Identity
    const markedByUser = await User.findById(markedByUserId);
    if (!markedByUser || !['teacher', 'admin'].includes(markedByUser.role)) {
      return res.status(403).json({ message: 'Only teachers and admins can mark attendance' });
    }

    const teacher = await Teacher.findOne({ userId: markedByUserId });
    if (!teacher && markedByUser.role === 'teacher') {
      return res.status(404).json({ message: 'Teacher profile not found for this user' });
    }

    // 2. Verify Device Approval Status (if not admin)
    let device;
    if (markedByUser.role === 'teacher') {
        device = await Device.findOne({ fingerprint: deviceFingerprint, teacherId: teacher?._id });
        if (!device) {
            return res.status(404).json({ message: 'Device not found or does not belong to this teacher' });
        }
        if (device.status !== 'approved') {
            return res.status(403).json({ message: 'Device is not approved for attendance marking' });
        }
        // Update lastUsedAt for the device
        device.lastUsedAt = new Date();
        await device.save();
    }


    // 3. Verify Class existence
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newAttendanceRecords = [];
    for (const record of attendanceRecords) {
      const { studentId, status, faceMatchImage, confidenceScore, manualOverride = false, overrideReason } = record;

      const student = await Student.findById(studentId);
      if (!student) {
        // Skip or report error for individual student
        console.warn(`Student with ID ${studentId} not found, skipping.`);
        continue;
      }

      // Check if student is enrolled in the class
      if (!classItem.students.includes(student._id)) {
          console.warn(`Student ${studentId} is not enrolled in class ${classId}, skipping.`);
          continue;
      }

      // Duplicate Prevention
      const existingAttendance = await Attendance.findOne({
        student: studentId,
        class: classId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (existingAttendance) {
        console.warn(`Attendance already marked for student ${studentId} in class ${classId} today, skipping.`);
        continue;
      }

      let finalConfidenceScore = confidenceScore;
      if (faceMatchImage && !finalConfidenceScore) {
        finalConfidenceScore = Math.random() * (1 - 0.7) + 0.7;
      }

      newAttendanceRecords.push({
        student: studentId,
        class: classId,
        date: new Date(),
        status,
        markedBy: markedByUser._id,
        device: device ? device._id : undefined, // Device might be undefined for admin bulk marking
        confidenceScore: finalConfidenceScore,
        faceMatchImage: faceMatchImage ? `/uploads/${faceMatchImage}` : undefined,
        manualOverride,
        overrideReason,
      });
    }

    if (newAttendanceRecords.length === 0) {
      return res.status(400).json({ message: 'No valid attendance records to mark' });
    }

    const insertedAttendance = await Attendance.insertMany(newAttendanceRecords);

    res.status(201).json({ message: 'Bulk attendance marked successfully', attendance: insertedAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
