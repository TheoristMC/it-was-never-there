import { GameMode, world, system, TicksPerSecond } from "@minecraft/server";

const blinkProps = {
  blinkCooldownsMap: new Map(),
  blinkCooldownDuration: 2.2, // This must match the full animation length in the UI side
  blinkBlurLifetime: 1.2, // How long should the blur last after the player has blink, this is aligned when the player fully closed his eyes
  notBlinkingLifetime: 5, // How many seconds till player needs to blink again
  maximumBlur: 19, // Maximum blur in seconds before the player blinks
};

function playerBlink(player) {
  const playerId = player.id;
  const timeNow = Date.now();
  const playerBlinkProps = blinkProps.blinkCooldownsMap.get(playerId) || {
    lastUsed: 0,
    blinkTime: blinkProps.notBlinkingLifetime,
  };

  if (
    timeNow - playerBlinkProps.lastUsed >=
    blinkProps.blinkCooldownDuration * 1000
  ) {
    player.onScreenDisplay.setTitle("iwnt_blink_1");
    system.runTimeout(
      () => player.onScreenDisplay.setTitle("iwnt_blink_0"),
      blinkProps.blinkCooldownDuration * TicksPerSecond
    );
    system.runTimeout(
      () => player.onScreenDisplay.setTitle("iwnt_blur_0"),
      blinkProps.blinkBlurLifetime * TicksPerSecond
    );
    playerBlinkProps.lastUsed = timeNow;
    playerBlinkProps.blinkTime = blinkProps.notBlinkingLifetime;
    blinkProps.blinkCooldownsMap.set(playerId, playerBlinkProps);
  }
}

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const playerBlinkProps = blinkProps.blinkCooldownsMap.get(player.id) || {
      lastUsed: 0,
      blinkTime: blinkProps.notBlinkingLifetime,
    };
    const blinkTime = playerBlinkProps.blinkTime;

    if (player.getGameMode() === GameMode.creative) return;

    if (blinkTime === -blinkProps.maximumBlur) {
      playerBlink(player);
      return;
    }

    playerBlinkProps.blinkTime--;
    if (blinkTime <= 0) {
      player.onScreenDisplay.setTitle(`iwnt_blur_${Math.abs(blinkTime)}`);
    }

    blinkProps.blinkCooldownsMap.set(player.id, playerBlinkProps);
  });
}, TicksPerSecond);

world.afterEvents.itemUse.subscribe((data) => {
  const { itemStack, source } = data;

  if (itemStack.typeId === "minecraft:compass") playerBlink(source);
});

// TODO: RESET PLAYER BLINK AFTER DYING
