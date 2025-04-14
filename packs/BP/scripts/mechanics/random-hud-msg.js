import { world } from "@minecraft/server";
import { getRandomElementInArray, getRandomInt } from "../iwnt";

const randomHUDMsgProps = {
  lastMessageShown: new Map(),
  maxLastMessageToStore: 3,
  messages: [
    "You've already done this.",
    "It's not real.",
    "Don't look at it.",
    "You forgot again, didn't you?",
    "Blink again. I dare you.",
    "Don't blink.",
    "You're not alone in here.",
    "You didn't name this, right?",
    "This block wasn't here.",
    "Just keep going.",
    "You did this to yourself.",
    "Everything is fine.",
  ],
};

world.afterEvents.itemUse.subscribe((data) => {
  const { itemStack, source } = data;

  if (itemStack.typeId === "minecraft:carrot") {
    const lastMessages =
      randomHUDMsgProps.lastMessageShown.get(source.id) || [];
    const filteredMessages = randomHUDMsgProps.messages.filter(
      (msg) => !lastMessages.includes(msg)
    );

    const randomMessage = getRandomElementInArray(filteredMessages);
    const randomOffsetType = getRandomInt(1, 5);

    source.onScreenDisplay.setTitle(
      `iwnt_msg_popup:${randomOffsetType}:${randomMessage}`
    );

    lastMessages.push(randomMessage);
    if (lastMessages.length > randomHUDMsgProps.maxLastMessageToStore)
      lastMessages.shift();

    randomHUDMsgProps.lastMessageShown.set(source.id, lastMessages);
  }
});
