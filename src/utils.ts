import { Snowflake } from "discord.js";
import { Server } from "./Server.model";
import { Message } from "./Message.model";
const nOrder = 2;

export const config = {
  prefix: "w!",
} as const;

export async function wordsAt(guild: Snowflake) {
  const server = await Server.findOne({ id: guild });

  if (!server) {
    throw new Error("Could not find server.");
  }

  const _messages = await Message.find({ server: server._id });

  const beginnings: string[] = [];
  _messages.map((text) => {
    const beginning = text.content.split(" ").slice(0, nOrder).join(" ");
    beginnings.push(beginning);
  });
  return beginnings;
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

  _messages.forEach((text) => {
    const word = text.content.split(" ");
    let words = [];
    for (let i = 0; i < word.length; i++) {
      words[i] = word[i] + " " + word[i + 1];
    }
    for (let i = 0; i < words.length; i++) {
      words[i] =
        words[i].split(" ")[1] === "undefined"
          ? words[i].split(" ").splice(-1, 1).join(" ")
          : words[i];
      if (words[i] === "undefined") continue;
      if (!ngrams[words[i]]) {
        ngrams[words[i]] = [];
      }
      ngrams[words[i]].push(
        words[i].split(" ")[nOrder - 1] === "undefined" ? "" : words[i + nOrder]
      );
    }
  });
  return await markov(guild, ngrams, isTriggered);
}

export async function markov(
  guild: Snowflake,
  ngrams: Record<string, string[]>,
  isTriggered: Boolean
) {
  const beginnings = await wordsAt(guild);
  if (beginnings.length < 10 * nOrder) {
    return isTriggered
      ? "Not enough messages in the lexicon. Try talking some more to build up the logs!"
      : "";
  }

  let currentGram = beginnings[~~(Math.random() * beginnings.length)];
  let arrayGram: string[];
  let result = "";
  for (let i = 0; i < 30; i++) {
    const possibilities = ngrams[currentGram];
    const next =
      i === 0
        ? currentGram
        : possibilities[~~(Math.random() * possibilities.length)];
    result += next + " ";
    arrayGram = result.split(" ");
    currentGram =
      arrayGram[arrayGram.length - 3] + " " + arrayGram[arrayGram.length - 2];
    currentGram.slice(0, result.length - 1);
    if (typeof ngrams[currentGram] === "undefined") {
      result = result.substring(0, result.lastIndexOf(" "));
      result = result.substring(0, result.lastIndexOf(" "));
      break;
    }
  }

  result = result.length >= 2000 ? result.substring(0, 1999) : result;
  return result;
}
