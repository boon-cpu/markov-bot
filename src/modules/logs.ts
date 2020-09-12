import CookiecordClient, {
  command,
  CommonInhibitors,
  Module,
  optional,
} from "cookiecord";
import { Message } from "discord.js";
import { Server } from "../Server.model";
import { Message as MessageModel } from "../Message.model";
import path from "path";
import fs from "fs";

export default class Logs extends Module {
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

  @command({
    aliases: ["log"],
    description: "Dms you the servers logs",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async logs(message: Message) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const guild = await Server.findOne({
      id: message.guild.id,
    });

    if (!guild) return message.channel.send("lol code broke");

    const _messages = await MessageModel.find({
      server: guild._id,
    });

    const messages = _messages.map((message) => message.content);

    const filename = path.join(
      __dirname,
      `${message.guild.id}-${new Date().getTime()}-messages.txt`
    );
    await fs.writeFileSync(filename, messages.join("\n"));

    await message.author.send({
      files: [filename],
    });
    fs.unlinkSync(filename);
    message.reply("Done");
  }

  @command({
    description: "Use a preset log for your server",
    inhibitors: [CommonInhibitors.hasGuildPermission("ADMINISTRATOR")],
  })
  async use(message: Message, @optional file?: string) {
    if (!message.guild) return;

    const server = await Server.findOne({ id: message.guild.id });

    if (!server) {
      await message.reply("somethign went wrong");
      return;
    }

    const guild = await Server.findOne({
      id: message.guild.id,
    });

    if (!guild) return message.channel.send("lol code broke");

    const filename = path.join(__dirname, `/../${file}.txt`);
    if (!fs.existsSync(filename)) {
      message.channel.send("Can't find that preset!");
      return;
    }

    const words = fs
      .readFileSync(path.join(__dirname, `/../${file}.txt`))
      .toString()
      .split("\n");

    const docs = words.map((word) => {
      return {
        content: word,
        server: guild._id,
        date: new Date(),
      };
    });
    await MessageModel.deleteMany({ server: guild._id });
    await MessageModel.insertMany(docs);
  }
}
