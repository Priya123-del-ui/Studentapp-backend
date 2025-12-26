import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  courseCode: string;
  description?: string;
  credits: number;
  department: string;
  instructor?: mongoose.Types.ObjectId; // Reference to Teacher or User model
  studentsEnrolled: mongoose.Types.ObjectId[]; // References to Student model
}

const courseSchema: Schema = new Schema({
  title: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, required: true, min: 1 },
  department: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User' }, // Or 'Teacher'
  studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
});

export default mongoose.model<ICourse>('Course', courseSchema);
