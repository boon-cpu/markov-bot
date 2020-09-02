import CookiecordClient, { HelpModule } from "cookiecord";

import dotenv from "dotenv-safe";
dotenv.config();

import { TextChannel } from "discord.js";
import { Message } from "./Message.model";
import { Server } from "./Server.model";
import { ngram } from "./utils";
import { connect } from "mongoose";

connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("[DB] Connected");
});

const client = new CookiecordClient({
  botAdmins: process.env.BOT_ADMINS!.split(","),
  prefix: "w!",
});

client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");

client.registerModule(HelpModule);

client.on("message", async (message) => {
  if (
    message.channel.type === "dm" ||
    message.author.id === "748916794995114035"
  )
    return;

  const getGuild = async () => {
    const { id } = (message.channel as TextChannel).guild;
    const model = await Server.findOne({ id });
    if (!model) {
      return await new Server({ id }).save();
    }

    return model;
  };

  const guildOptions = await getGuild();

  if (Math.random() * 100 <= guildOptions.probability) {
    if (!message.guild) return;
    const output = await ngram(message.guild.id, { isTriggered: true });

    if (output === "") return;

    message.channel.startTyping();
    console.log("Resolved!");

    setTimeout(async () => {
      await message.channel.send(output);
      await message.channel.stopTyping(true);
    }, 1000);

    // TODO: ~~Send our markov here for funny!~~
    // TODO: ~~I must say sir this does seem to be funny!~~ [closed - marked as duplicate]
  }

  if (message.content.split(" ").length <= 2) return;

  await new Message({
    content: message.content,
    server: guildOptions._id,
  }).save();
});

client.login(process.env.TOKEN!).then();

client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
