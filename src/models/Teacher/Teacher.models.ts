import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  department: string;
  classesTaught: mongoose.Types.ObjectId[]; // References to Class model
}

const teacherSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  classesTaught: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
});

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
