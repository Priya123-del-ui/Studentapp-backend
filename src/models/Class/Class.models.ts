import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  courseCode: string;
  name: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

const classSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  schedule: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

export default mongoose.model<IClass>('Class', classSchema);
