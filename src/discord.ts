import { MessageBuilder, Webhook } from "discord-webhook-node";
import { DISCORD_WEBHOOK } from "./config";
import { MappedFundingRate } from "./models";

const hook = new Webhook(DISCORD_WEBHOOK);
const IMAGE_URL = "https://homepages.cae.wisc.edu/~ece533/images/airplane.png";
hook.setUsername("Funding Finn");
hook.setAvatar(IMAGE_URL);

export const sendDiscord = (message: MessageBuilder) => hook.send(message);

export const getDiscordMessage = (rates: MappedFundingRate[]) => {
  let msg = new MessageBuilder()
    .setTitle("Funding Rates")
    .setAuthor(
      "Funding Finn",
      "https://homepages.cae.wisc.edu/~ece533/images/airplane.png"
    );

  rates.forEach((rate) => {
    msg = msg
      .addField("Symbol", `${rate.symbol}`, true)
      .addField("Rate", `${(rate.meanRate * 100).toFixed(4)}%`, true)
      .addField(
        "Annualised Rate",
        `${(rate.annualizedRate * 100).toFixed(2)}%`,
        true
      );
  });

  msg = msg.setTimestamp();
  return msg;
};
