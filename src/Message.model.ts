import mongoose from "mongoose";

interface IMessage extends mongoose.Document {
  content: string;
  server: string;
  date: Date;
}

const Schema = new mongoose.Schema({
  content: String,
  server: mongoose.SchemaTypes.ObjectId,
  date: Date,
});

export const Message = mongoose.model<IMessage>("message", Schema);
