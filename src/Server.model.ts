import mongoose from "mongoose";
import { Snowflake } from "discord.js";

export interface IServer extends mongoose.Document {
  id: Snowflake;
  probability: number;
  channel: Snowflake;
  exclude: Snowflake[];
  submitted: Date;
}

const Schema = new mongoose.Schema({
  id: String,
  probability: { default: 10, type: Number },
  channel: { default: "", type: String },
  exclude: { default: [], type: Array },
  submitted: { default: new Date(), type: Date },
});

export const Server = mongoose.model<IServer>("server", Schema);
