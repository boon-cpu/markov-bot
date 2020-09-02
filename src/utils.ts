import { Snowflake } from "discord.js";
import { Server } from "./Server.model";
import { Message } from "./Message.model";

export async function wordsAt(guild: Snowflake) {
  const server = await Server.findOne({ id: guild });

  if (!server) {
    throw new Error("Could not find server.");
  }

  const _messages = await Message.find({ server: server._id });

  return _messages.map((message) => {
    return message.content.split(" ")[0];
  });
}

export async function ngram(
  guild: Snowflake,
  options: { isTriggered: Boolean }
) {
  const { isTriggered } = options;
  const ngrams: Record<string, string[]> = {};
  const server = await Server.findOne({ id: guild });

  if (!server) {
    throw new Error("Could not find server.");
  }

  const _messages = await Message.find({ server: server._id });

  _messages.map((message) => {
    const words = message.content.split(" ");

    words.map((word) => {
      if (!ngrams[word]) {
        ngrams[word] = [];
      }
      ngrams[word].push(
        words[words.indexOf(word) + 1] === "undefined"
          ? ""
          : words[words.indexOf(word) + 1]
      );
    });
  });
  return await markov(guild, ngrams, isTriggered);
}

export async function markov(
  guild: Snowflake,
  ngrams: any,
  isTriggered: Boolean
) {
  const beginnings = await wordsAt(guild);
  if (beginnings.length < 10) {
    return isTriggered
      ? "Not enough messages in the lexicon. Try talking some more to build up the logs!"
      : "";
  }

  let currentGram: string =
    beginnings[Math.floor(Math.random() * beginnings.length)];
  let arrayGram: string[];
  let result: string = "";
  for (let i = 0; i < 30; i++) {
    const possibilities = ngrams[currentGram];
    const next =
      i === 0
        ? currentGram
        : possibilities[Math.floor(Math.random() * possibilities.length)];
    result += next + " ";
    console.log(result);
    arrayGram = result.split(" ");
    currentGram = arrayGram[arrayGram.length - 2];
    currentGram.slice(0, result.length - 1);
    if (typeof ngrams[currentGram] === "undefined") {
      result = result.substring(0, result.lastIndexOf(" "));
      result = result.substring(0, result.lastIndexOf(" "));
      break;
    }
  }
  return result;
}
