import mongoose from "mongoose";
import { Snowflake } from "discord.js";

interface IServer extends mongoose.Document {
  id: Snowflake;
  probability: number;
  channel: Snowflake;
}

const Schema = new mongoose.Schema({
  id: String,
  probability: { default: 10, type: Number },
  channel: { default: "", type: String },
});

export const Server = mongoose.model<IServer>("server", Schema);
