import CookiecordClient, {
  command,
  CommonInhibitors,
  Module,
} from "cookiecord";
import { Message, Permissions } from "discord.js";
import { Message as MessageModel } from "../Message.model";
import { Server } from "../Server.model";

export default class Delete extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["delete"],
    description: "Deletes the dataset",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async deletelogs(message: Message) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    await MessageModel.deleteMany({
      server: server._id,
    });

    await message.reply("done.");
  }
}
