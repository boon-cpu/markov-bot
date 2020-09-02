import { Server } from "../Server.model";
import CookiecordClient, { Module, command } from "cookiecord";
import { Message, Permissions } from "discord.js";
import { Message as MessageModel } from "../Message.model";

export default class Probability extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    description: "deletes the dataset",
  })
  async delete(message: Message) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

    await MessageModel.deleteMany({
      server: message.guild.id,
    });

    await message.reply("done.");
  }
}
