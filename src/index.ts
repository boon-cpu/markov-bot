import CookiecordClient, { HelpModule } from "cookiecord";

import dotenv from "dotenv-safe";
import { TextChannel } from "discord.js";
import { Message } from "./Message.model";
import { Server } from "./Server.model";
import { ngram } from "./utils";
import { connect } from "mongoose";

dotenv.config();

const prefix = "w!";

connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("[DB] Connected");
});

const client = new CookiecordClient({
  botAdmins: process.env.BOT_ADMINS!.split(","),
  prefix,
});

client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");

client.registerModule(HelpModule);

client.on("message", async (message) => {
  const isDm = message.channel.type === "dm";
  const isSelf = message.author.id === client.user!.id;

  if (isDm || isSelf || !message.guild) {
    return;
  }

  const usingSafeMode = process.env.MESSAGE_SAFE_MODE === "on";
  const startsWithPrefix = message.content.startsWith(prefix);

  if (usingSafeMode && startsWithPrefix) {
    return;
  }

  const getGuild = async () => {
    const { id } = (message.channel as TextChannel).guild;
    const model = await Server.findOne({ id });

    if (!model) {
      return await new Server({ id }).save();
    }

    return model;
  };

  const guildOptions = await getGuild();

  if (guildOptions.channel !== message.channel.id) return;

  const saveMessage = async () => {
    if (message.content.split(" ").length < 2) return;

    await new Message({
      content: message.content,
      server: guildOptions._id,
    }).save();
  };
  saveMessage();

  if (guildOptions.probability >= Math.random() * 100) {
    if (!message.guild) return;
    const output = await ngram(message.guild.id, { isTriggered: false });

    if (output === "" || output === " ") return;

    message.channel.startTyping();

    setTimeout(async () => {
      await message.channel.send(output);
      await message.channel.stopTyping(true);
    }, 3000);
  }
});

client.login(process.env.TOKEN!).then();

client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
