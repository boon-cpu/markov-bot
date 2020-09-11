import { Message, TextChannel } from "discord.js";

import {
  command,
  default as CookiecordClient,
  listener,
  Module,
} from "cookiecord";

import { config, ngram } from "../utils";
import { IServer, Server } from "../Server.model";

import { Message as MessageModel } from "../Message.model";

export default class Trigger extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  private static async saveMessage(message: Message, guildOptions: IServer) {
    if (message.content.split(" ").length < 2) return;

    await new MessageModel({
      content: message.content,
      server: guildOptions._id,
      date: new Date(),
    }).save();
  }

  private static async getGuild(message: Message) {
    const { id } = (message.channel as TextChannel).guild;
    const model = await Server.findOne({ id });

    if (!model) {
      return await new Server({ id }).save();
    }

    return model;
  }

  @command({ aliases: ["trig"], description: "Triggers the markov chain" })
  async trigger(message: Message) {
    if (!message.guild) return;

    const output = await ngram(message.guild.id, {
      isTriggered: true,
    });

    if (output === "" || output === " ") {
      return;
    }

    await message.channel.send(output);
  }

  @listener({ event: "message" })
  async handleMessage(message: Message) {
    const isDm = message.channel.type === "dm";
    const isSelf = message.author.id === this.client.user?.id;

    if (isDm || isSelf || !message.guild) {
      return;
    }

    const usingSafeMode = process.env.MESSAGE_SAFE_MODE === "on";
    const startsWithPrefix = message.content.startsWith(config.prefix);

    if (usingSafeMode && startsWithPrefix) {
      return;
    }

    const guildOptions = await Trigger.getGuild(message);

    if (guildOptions.channel !== message.channel.id) return;
    if (guildOptions.exclude.includes(message.author.id)) return;

    const { id } = (message.channel as TextChannel).guild;
    const server = await Server.findOne({ id: id });
    const messages = await MessageModel.find({ server: server?._id });

    if (messages.length <= 1000) {
      await Trigger.saveMessage(message, guildOptions);
    } else {
      const sorted = await MessageModel.find({ server: server?._id }).sort({
        date: 1,
      });

      const id: String = sorted[0]._id;

      await MessageModel.deleteOne({ _id: id });

      await Trigger.saveMessage(message, guildOptions);
    }

    if (guildOptions.probability >= Math.random() * 100) {
      if (!message.guild) return;
      const output = await ngram(message.guild.id, { isTriggered: false });

      if (output === "" || output === " ") return;

      message.channel.startTyping();

      setTimeout(async () => {
        await message.channel.send(output);
        await message.channel.stopTyping(true);
      }, 3000);
    }
  }
}
