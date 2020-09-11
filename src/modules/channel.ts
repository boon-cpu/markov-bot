import CookiecordClient, {
  command,
  CommonInhibitors,
  Module,
} from "cookiecord";
import { Message, Permissions } from "discord.js";
import { Server } from "../Server.model";

export default class Channel extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["setchannel"],
    description: "Binds bot to current channel",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async channel(message: Message) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    server.channel = message.channel.id;
    server.save();

    message.channel.send("Binded to this channel!");
  }
}
