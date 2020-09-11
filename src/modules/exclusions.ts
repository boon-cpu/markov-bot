import { Message } from "discord.js";

import {
  command,
  CommonInhibitors,
  default as CookiecordClient,
  Module,
} from "cookiecord";

import { Server } from "../Server.model";

export default class Exclusions extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["exc"],
    description: "Excludes player from being recorded",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async exclude(message: Message) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const member = message.mentions.users.first();

    if (!member) {
      const excluded = server.exclude.map((user) => {
        return `<@${user}>`;
      });
      await message.reply(
        "Current excluded members are: " + excluded.join(", ")
      );
      return;
    }

    server.exclude.push(member.id);
    await server.save();

    await message.channel.send(`Cheers! now excluding <@${member.id}>`);
  }

  @command({
    aliases: ["inc"],
    description: "Removes user from exclude list",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async include(message: Message) {
    if (!message.guild) return;

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
  @command({
    aliases: ["incall", "incAll", "includeall"],
    description: "Removes all users from exclude list",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async includeAll(message: Message) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    server.exclude = [];

    await server.save();

    await message.channel.send(`Cheers! now including all members`);
  }
}
