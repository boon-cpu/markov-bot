import mongoose from "mongoose";
import { Snowflake } from "discord.js";

interface IServer extends mongoose.Document {
  id: Snowflake;
  collectionChannel: Snowflake;
  probability: number;
}

const Schema = new mongoose.Schema({
  id: String,
  collectionChannel: String,
  probability: { default: 10, type: Number },
});

export const Server = mongoose.model<IServer>("server", Schema);
