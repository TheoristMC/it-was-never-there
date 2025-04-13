import { TicksPerSecond } from "@minecraft/server";

import "./mechanics/blinking.js";
import "./mechanics/random-hud-msg.js";
// import "./mechanics/item-transform-to-useless.js"; | Needs more development
// import "./mechanics/item-name-distortion.js"; | Needs more development

function generateRandomTick(min, max) {
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return TicksPerSecond * randomNumber;
}

function getRandomElementInArray(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { generateRandomTick, getRandomElementInArray, getRandomInt };
