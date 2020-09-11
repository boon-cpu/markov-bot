import { Message, Permissions } from "discord.js";

import CookiecordClient, { command, Module } from "cookiecord";

import { Server } from "../Server.model";

export default class Exclusions extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["exc"],
    description: "Excludes player from being recorded",
  })
  async exclude(message: Message) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const member = message.mentions.users.first();

    if (!member) {
      return;
    }

    server.exclude.push(member.id);
    await server.save();

    await message.channel.send(`Cheers! now excluding <@${member.id}>`);
  }

  @command({
    aliases: ["inc"],
    description: "Removes user from exclude list",
  })
  async include(message: Message) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const member = message.mentions.users.first();

    if (!member) {
      return;
    }

    if (server.exclude.includes(member.id)) {
      server.exclude = server.exclude.filter((id) => id !== member.id);
    }

    await server.save();

    await message.channel.send(`Cheers! now including <@${member.id}>`);
  }
}
