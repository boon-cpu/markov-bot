import { Message, Permissions } from "discord.js";

import CookiecordClient, { command, Module, optional } from "cookiecord";

import { Server } from "../Server.model";

export default class Probability extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["prob", "probability", "setprob"],
    description: "Sets the probability of messages",
  })
  async setprobability(message: Message, @optional probability?: number) {
    if (!message.guild) return;

    if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply("you do not have permission to use this command!");
    }

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
