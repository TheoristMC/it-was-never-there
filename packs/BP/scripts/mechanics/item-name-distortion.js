import { world, system, EntityComponentTypes } from "@minecraft/server";

import { generateRandomTick, getRandomElementInArray } from "../iwnt";

function nameSortAlphabetically(itemName) {
  return itemName
    .replace("minecraft:", "")
    .split("_")
    .map((word) => {
      const sortedLetters = word.toLowerCase().split("").sort().join("");
      return sortedLetters.charAt(0).toUpperCase() + sortedLetters.slice(1);
    })
    .join(" ");
}

const tickSelected = generateRandomTick(10, 20);
world.sendMessage(`${tickSelected / 20} seconds is selected.`);

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const inventory = player.getComponent(
      EntityComponentTypes.Inventory
    ).container;
    const itemHasBeenSelectedSuffix = "§h§a§s§r";
    const itemsArray = [];

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory?.getItem(i);
      if (!item || item.nameTag?.includes(itemHasBeenSelectedSuffix) || i <= 8)
        continue;

      itemsArray.push({
        slot: i,
        item,
      });
    }

    if (itemsArray.length === 0) return;

    const { item, slot } = getRandomElementInArray(itemsArray);
    item.nameTag =
      nameSortAlphabetically(item.typeId) + itemHasBeenSelectedSuffix;
    inventory.setItem(slot, item);
  });
}, tickSelected);
