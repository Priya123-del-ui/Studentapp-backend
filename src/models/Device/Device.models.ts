import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  fingerprint: string;
  teacherId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  registeredAt: Date;
  lastUsedAt?: Date;
}

const deviceSchema: Schema = new Schema({
  fingerprint: { type: String, required: true, unique: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'revoked'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
});

export default mongoose.model<IDevice>('Device', deviceSchema);
