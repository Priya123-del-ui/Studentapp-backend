import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  rollNumber: string;
  department: string;
  batch: string;
  enrollmentStatus: 'enrolled' | 'graduated' | 'dropped';
  faceData: string[]; // Array of image URLs or paths
}

const studentSchema: Schema = new Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  enrollmentStatus: { type: String, required: true, enum: ['enrolled', 'graduated', 'dropped'], default: 'enrolled' },
  faceData: [{ type: String }], // Store image URLs or paths
});

export default mongoose.model<IStudent>('Student', studentSchema);
