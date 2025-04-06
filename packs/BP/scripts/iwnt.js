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
    .replaceAll("_", " ")
    .split(" ")
    .map(word => {
      const [first, ...rest] = word;
      return [first.toUpperCase(), ...rest].sort().join("");
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
      if (!(item || item?.nameTag?.includes(itemHasBeenSelectedSuffix))) continue;

      itemsArray.push({
        slot: i,
        item
      });
    }

    const { item, slot } = getRandomElementInArray(itemsArray);
    item.nameTag = nameSortAlphabetically(item.typeId) + itemHasBeenSelectedSuffix;
    inventory.setItem(slot, item);
  });
}, tickSelected);