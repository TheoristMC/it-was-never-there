import { system, TicksPerSecond, world } from "@minecraft/server";
import {
  getRandomElementInArray,
  getRandomInt,
  generateRandomTick,
} from "../iwnt";

const randomHUDMsgProps = {
  lastMessageShown: new Map(),
  maxLastMessageToStore: 3,
  msgPopupLifetime: 3.2,
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

function randomMsgPopup(player) {
  const lastMessages = randomHUDMsgProps.lastMessageShown.get(player.id) || [];
  const filteredMessages = randomHUDMsgProps.messages.filter(
    (msg) => !lastMessages.includes(msg)
  );

  const randomMessage = getRandomElementInArray(filteredMessages);

  const randomOffsetType = getRandomInt(1, 5);
  /*
    LIST OF ALL OFFSETS: (Can be changed on ui/iwnt/msg_popup,json)

    "#offset_1": [
      64,
      57
    ],
    "#offset_2": [
      58,
      -96
    ],
    "#offset_3": [
      -84,
      65
    ],
    "#offset_4": [
      -74,
      54
    ],
    "#offset_5": [
      40,
      -10
    ]
  */

  player.onScreenDisplay.setTitle(
    `iwnt_msg:${randomOffsetType}:${randomMessage}`
  );
  system.runTimeout(
    () => player.onScreenDisplay.setTitle("iwnt_update_msg"), // We need to do this to update the binding in the UI side
    1
  );
  system.runTimeout(
    () => player.onScreenDisplay.setTitle("iwnt_msg_no"),
    randomHUDMsgProps.msgPopupLifetime * TicksPerSecond
  );

  lastMessages.push(randomMessage);
  if (lastMessages.length > randomHUDMsgProps.maxLastMessageToStore)
    lastMessages.shift();

  randomHUDMsgProps.lastMessageShown.set(player.id, lastMessages);
}

const tickSelected = generateRandomTick(5, 12);
console.warn(`${tickSelected / 20} seconds is selected for Random Message Popup`);

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    randomMsgPopup(player);
  });
}, tickSelected);
