import { Message } from "discord.js";
import { command, default as CookiecordClient, Module } from "cookiecord";
import { ngram } from "../utils";

export default class Trigger extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({ aliases: ["trig"], description: "Triggers the markov chain" })
  async trigger(message: Message) {
    if (!message.guild) return;

    const output = await ngram(message.guild.id, {
      isTriggered: true,
    });

    if (output === "") {
      await message.channel.send("gib lexicon");
      return;
    }

    await message.channel.send(output);
  }
}
