import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  grade?: string;
  status: 'enrolled' | 'completed' | 'dropped';
}

const enrollmentSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, default: Date.now, required: true },
  grade: { type: String },
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled', required: true },
});

// Ensure a student can only be enrolled in a course once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
