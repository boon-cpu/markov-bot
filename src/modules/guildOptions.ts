import CookiecordClient, {
  command,
  CommonInhibitors,
  Module,
  optional,
} from "cookiecord";
import { Message } from "discord.js";
import { Server } from "../Server.model";

export default class GuildOptions extends Module {
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

  @command({
    aliases: ["prob", "probability", "setprob"],
    description: "Sets the probability of messages",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async setprobability(message: Message, @optional probability?: number) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    if (!probability && probability !== 0) {
      await message.channel.send(
        `Probability currently set to: \`${server.probability}%\``
      );

      return;
    }

    server.probability = probability;
    await server.save();

    await message.channel.send(
      `Cheers! probability set to \`${probability}%\``
    );
  }
}
