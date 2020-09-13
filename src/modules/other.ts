import { Message } from "discord.js";
import CookiecordClient, {
  command,
  CommonInhibitors,
  Module,
} from "cookiecord";
import dotenv from "dotenv-safe";

dotenv.config();

export default class Misc extends Module {
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
  @command({
    aliases: ["issue", "iss", "bug", "report"],
    description: "Report a bug to the developers",
    single: true,
  })
  async feedback(message: Message, args: string) {
    if (!message.guild) return;

    message.channel.send("Thanks for the feedback");
    this.client.users.cache
      .get(process.env.MAIN_DEFAULT_OWNER!)
      ?.send(
        "Feedback:\n" +
          `\`\`\`\n${args}\nServer: ${message.guild.id}\nUser: ${message.author.id}\`\`\``
      );
  }
}
