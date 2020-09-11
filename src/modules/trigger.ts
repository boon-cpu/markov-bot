import { Message, TextChannel } from "discord.js";

import {
  command,
  default as CookiecordClient,
  listener,
  Module,
} from "cookiecord";

import { config, ngram } from "../utils";
import { Server } from "../Server.model";

import { Message as MessageModel } from "../Message.model";

export default class Trigger extends Module {
  constructor(client: CookiecordClient) {
    super(client);
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

    const getGuild = async () => {
      const { id } = (message.channel as TextChannel).guild;
      const model = await Server.findOne({ id });

      if (!model) {
        return await new Server({ id }).save();
      }

      return model;
    };

    const guildOptions = await getGuild();

    if (guildOptions.channel !== message.channel.id) return;
    if (guildOptions.exclude.includes(message.author.id)) return;

    const saveMessage = async () => {
      if (message.content.split(" ").length < 2) return;

      await new MessageModel({
        content: message.content,
        server: guildOptions._id,
        date: new Date(),
      }).save();
    };

    const { id } = (message.channel as TextChannel).guild;
    const server = await Server.findOne({ id: id });
    const messages = await MessageModel.find({ server: server?._id });

    if (messages.length <= 1000) {
      await saveMessage();
    } else {
      const sorted = await MessageModel.find({ server: server?._id }).sort({
        date: 1,
      });

      const id: String = sorted[0]._id;
      MessageModel.deleteOne({ _id: id })
        .then()
        .catch((err) => {
          console.log(err);
        });

      await saveMessage();
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
