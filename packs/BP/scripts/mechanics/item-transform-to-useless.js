import {
  system,
  world,
  EntityComponentTypes,
  ItemStack,
} from "@minecraft/server";
import { getRandomElementInArray, generateRandomTick } from "../iwnt";

const itemTransfUselessProps = {
  itemAlreadyBeenSelectedFlag: "RUI:flag",
  uselessItems: ["bone", "rotten_flesh", "web", "poppy"], // Items here should be stackable to 64
};

const tickSelected = generateRandomTick(1, 10);
console.warn(`${tickSelected / 20} seconds is selected.`);

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const inventory = player.getComponent(
      EntityComponentTypes.Inventory
    ).container;
    const itemsArray = [];

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory?.getItem(i);
      if (!item || item.getLore().includes(itemTransfUselessProps.itemAlreadyBeenSelectedFlag) || i <= 8)
        continue;

      itemsArray.push({
        slot: i,
        item,
      });
    }

    if (itemsArray.length === 0) return;

    const { item, slot } = getRandomElementInArray(itemsArray);

    const randomUselessItem = new ItemStack(
      getRandomElementInArray(itemTransfUselessProps.uselessItems),
      item.amount
    );
    randomUselessItem.setLore([itemTransfUselessProps.itemAlreadyBeenSelectedFlag]);
    inventory.setItem(slot, randomUselessItem);
  });
}, tickSelected);
