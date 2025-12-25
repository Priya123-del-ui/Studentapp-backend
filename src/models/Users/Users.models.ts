import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: 'student' | 'teacher' | 'admin';
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher', 'admin'] },
});

export default mongoose.model<IUser>('User', userSchema);
