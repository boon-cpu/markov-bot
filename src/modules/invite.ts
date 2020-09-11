import { Message } from "discord.js";
import { command, default as CookiecordClient, Module } from "cookiecord";

export default class Invite extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @command({
    aliases: ["inv"],
    description: "Sends the invite link for the bot",
  })
  async invite(message: Message) {
    message.channel.send(
      "<https://discord.com/api/oauth2/authorize?client_id=748916794995114035&permissions=0&scope=bot>"
    );
  }
}
