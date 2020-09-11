import fs from "fs";
import path, { dirname } from "path";
import { Message, Permissions } from "discord.js";
import { command, default as CookiecordClient, Module } from "cookiecord";
import { Message as MessageModel } from "../Message.model";
import { Server } from "../Server.model";

export default class Logs extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["log"],
    description: "Dms you the servers logs",
  })
  async logs(message: Message) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const guild = await Server.findOne({
      id: message.guild.id,
    });

    if (!guild) return message.channel.send("lol code brokecd");

    const _messages = await MessageModel.find({
      server: guild._id,
    });

    const messages = _messages.map((message) => message.content);

    const filename = path.join(
      __dirname,
      `${message.guild.id}-${new Date().getTime()}-messages.txt`
    );
    await fs.writeFileSync(filename, messages.join("\n"));

    await message.channel.send({
      files: [filename],
    });
    fs.unlinkSync(filename);
  }
}
