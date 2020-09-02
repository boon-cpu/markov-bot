import mongoose from "mongoose";

interface IMessage extends mongoose.Document {
  content: string;
  server: string;
}

const Schema = new mongoose.Schema({
  content: String,
  server: mongoose.SchemaTypes.ObjectId,
});

export const Message = mongoose.model<IMessage>("message", Schema);
