import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: 'student' | 'teacher' | 'admin';
  passwordResetToken?: string;
  passwordResetExpires?: number;
  refreshToken?: string;
  profilePhoto?: string;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher', 'admin'] },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshToken: { type: String },
  profilePhoto: { type: String },
});

export default mongoose.model<IUser>('User', userSchema);
