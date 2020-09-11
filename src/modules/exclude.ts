import { Message, Permissions } from "discord.js";

import {
  command,
  default as CookiecordClient,
  Module,
  optional,
} from "cookiecord";

import { Server } from "../Server.model";

export default class Exclude extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["exc"],
    description: "Excludes player from being recorded",
  })
  async exclude(message: Message, @optional member?: string) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    if (!member && member !== "0") {
      return;
    }
    server.exclude.push(member.substring(3, member.length - 1));
    await server.save();

    await message.channel.send(
      `Cheers! now excluding <@${member.substring(3, member.length - 1)}>`
    );
  }
}
