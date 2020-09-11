import CookiecordClient, { HelpModule } from "cookiecord";

import dotenv from "dotenv-safe";
import { connect } from "mongoose";
import { config } from "./utils";

dotenv.config();

connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("[DB] Connected");
});

const client = new CookiecordClient({
  botAdmins: process.env.BOT_ADMINS!.split(","),
  prefix: config.prefix,
});

client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");

client.registerModule(HelpModule);

client.login(process.env.TOKEN!).then();

client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
