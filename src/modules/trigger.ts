import { Guild, Message, TextChannel } from "discord.js";

import CookiecordClient, { command, listener, Module } from "cookiecord";

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
      content: message.cleanContent,
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

    const output = await ngram(
      message.guild.id,
      {
        isTriggered: true,
      },
      message
    );

    if (!output || output.trim() === "") {
      return;
    }

    await message.channel.send(output);
  }

  @listener({ event: "message" })
  async handleMessage(message: Message) {
    if (message.author.bot) return;

    if (!message.guild) {
      return;
    }

    const usingSafeMode = process.env.MESSAGE_SAFE_MODE === "on";
    const startsWithPrefix = message.cleanContent.startsWith(config.prefix);

    if (usingSafeMode && startsWithPrefix) {
      return;
    }

    const guildOptions = await Trigger.getGuild(message);

    if (guildOptions.channel !== message.channel.id) return;
    if (guildOptions.exclude.includes(message.author.id)) return;

    const { id } = (message.channel as TextChannel).guild;
    const server = await Server.findOne({ id: id });
    const messages = await MessageModel.find({ server: server?._id });

    if (messages.length <= 2000) {
      await Trigger.saveMessage(message, guildOptions);
    } else {
      const sorted = await MessageModel.find({ server: server?._id }).sort({
        date: 1,
      });

      await MessageModel.deleteOne({ _id: sorted[0]._id });
      await Trigger.saveMessage(message, guildOptions);
    }

    if (guildOptions.probability >= Math.random() * 100) {
      if (!message.guild) return;
      const output = await ngram(
        message.guild.id,
        { isTriggered: false },
        message
      );

      if (!output || output.trim() === "") return;

      // await message.channel.startTyping();

      // setTimeout(async () => {
      await message.channel.stopTyping(true);
      await message.channel.send(output);
      // await message.channel.stopTyping(true);
      // }, 2000);
    }
  }

  @listener({ event: "guildCreate" })
  async handleJoin(guild: Guild) {
    const channel = guild.channels.cache.find(
      (channel) =>
        channel.type === "text" &&
        channel.permissionsFor(guild.me!)!.has("SEND_MESSAGES")
    );
    if (!channel) return;
    (channel as TextChannel).send(
      "Hi there :wave:,\nTo get started use `w!channel` to bind me to your desired channel.\nIf you get confused you can use `w!help` for more information."
    );
    await new Server({ id: guild!.id }).save();
  }

  @listener({ event: "guildDelete" })
  async handleExit(guild: Guild) {
    const serverId = await Server.findOne({ id: guild.id });
    await MessageModel.deleteMany({ server: serverId?._id });
    serverId?.remove();
  }
}
