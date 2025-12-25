import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'excused';
  markedBy: mongoose.Types.ObjectId; // User or Teacher ID
  device: mongoose.Types.ObjectId;
  confidenceScore?: number;
  faceMatchImage?: string;
  manualOverride: boolean;
  overrideReason?: string;
}

const attendanceSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, required: true, enum: ['present', 'absent', 'excused'], default: 'present' },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  confidenceScore: { type: Number, min: 0, max: 1 },
  faceMatchImage: { type: String },
  manualOverride: { type: Boolean, default: false },
  overrideReason: { type: String },
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
