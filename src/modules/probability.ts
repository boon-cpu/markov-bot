import { Message } from "discord.js";

import {
  command,
  default as CookiecordClient,
  Module,
  optional,
} from "cookiecord";

import { Server } from "../Server.model";

export default class Probability extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["prob", "probability", "setprob"],
    description: "Triggers the markov chain",
  })
  async setprobability(message: Message, @optional probability?: number) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });
    if (!server) return;

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
