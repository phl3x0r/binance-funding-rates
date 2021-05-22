import { MessageBuilder, Webhook } from "discord-webhook-node";
import { DISCORD_WEBHOOK } from "./config";

const hook = new Webhook(DISCORD_WEBHOOK);
const IMAGE_URL = "https://homepages.cae.wisc.edu/~ece533/images/airplane.png";
hook.setUsername("Funding Finn");
hook.setAvatar(IMAGE_URL);

export const sendDiscord = (message: string) => hook.send(message);
