import { EntityComponentTypes, system, TicksPerSecond, world } from "@minecraft/server";

function generateRandomTick(min = 10, max = 20) {
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return TicksPerSecond * randomNumber;
}

function getRandomElementInArray(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function nameSortAlphabetically(itemName) {
  return itemName
    .replace("minecraft:", "")
    .split("_")
    .map(word => {
      const sortedLetters = word
        .toLowerCase()
        .split("")
        .sort()
        .join("");
      return sortedLetters.charAt(0).toUpperCase() + sortedLetters.slice(1);
    })
    .join(" ");
}

const tickSelected = generateRandomTick();
world.sendMessage(`${tickSelected / 20} seconds is selected.`);

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const inventory = player.getComponent(EntityComponentTypes.Inventory).container;
    const itemHasBeenSelectedSuffix = "§h§a§s§r";
    const itemsArray = [];

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory?.getItem(i);
      if (!item || item.nameTag?.includes(itemHasBeenSelectedSuffix)) continue;

      itemsArray.push({
        slot: i,
        item
      });
    }

    if (itemsArray.length === 0) return;

    const { item, slot } = getRandomElementInArray(itemsArray);
    item.nameTag = nameSortAlphabetically(item.typeId) + itemHasBeenSelectedSuffix;
    inventory.setItem(slot, item);
  });
}, tickSelected);

const blinkCooldowns = new Map();
const cooldownDuration = 1.55;

world.afterEvents.itemUse.subscribe((data) => {
  const { itemStack, source } = data;

  if (itemStack.typeId === "minecraft:compass") {
    const playerId = source.id;
    const timeNow = Date.now();
    const lastUsed = blinkCooldowns.get(playerId) || 0;

    if (timeNow - lastUsed >= (cooldownDuration * 1000)) {
      source.onScreenDisplay.setTitle("iwnt_blink");
      blinkCooldowns.set(playerId, timeNow);
    }
  }
});