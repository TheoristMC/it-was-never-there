import {
  EntityComponentTypes,
  GameMode,
  system,
  TicksPerSecond,
  world,
} from "@minecraft/server";

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
    .map((word) => {
      const sortedLetters = word.toLowerCase().split("").sort().join("");
      return sortedLetters.charAt(0).toUpperCase() + sortedLetters.slice(1);
    })
    .join(" ");
}

const tickSelected = generateRandomTick();
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
      if (!item || item.nameTag?.includes(itemHasBeenSelectedSuffix)) continue;

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

const blinkProps = {
  blinkCooldownsMap: new Map(),
  blinkCooldownDuration: 1.55, // This must match the full animation length in the UI side
  notBlinkingLifetime: 8, // How many seconds till player needs to blink again
};

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const playerBlinkProps = blinkProps.blinkCooldownsMap.get(player.id) || {
      lastUsed: 0,
      blinkTime: blinkProps.notBlinkingLifetime,
    };

    if (player.getGameMode() === GameMode.creative) return;

    playerBlinkProps.blinkTime--;

    if (playerBlinkProps.blinkTime <= (blinkProps.notBlinkingLifetime / 2)) {
      player.onScreenDisplay.setActionBar("Please blink now.");
    }

    if (playerBlinkProps.blinkTime <= 0) {
      player.applyDamage(0.25);
    }

    blinkProps.blinkCooldownsMap.set(player.id, playerBlinkProps);
  });
}, TicksPerSecond);

world.afterEvents.itemUse.subscribe((data) => {
  const { itemStack, source } = data;

  if (itemStack.typeId === "minecraft:compass") {
    const playerId = source.id;
    const timeNow = Date.now();
    const playerBlinkProps = blinkProps.blinkCooldownsMap.get(playerId) || {
      lastUsed: 0,
      blinkTime: blinkProps.notBlinkingLifetime,
    };

    if (
      timeNow - playerBlinkProps.lastUsed >=
      blinkProps.blinkCooldownDuration * 1000
    ) {
      source.onScreenDisplay.setTitle("iwnt_blink");
      playerBlinkProps.blinkTime = blinkProps.notBlinkingLifetime;
      playerBlinkProps.lastUsed = timeNow;
      blinkProps.blinkCooldownsMap.set(playerId, playerBlinkProps);
    }
  }
});
