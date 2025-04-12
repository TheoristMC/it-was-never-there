import {
  GameMode,
  world,
  system,
  TicksPerSecond,
  EntityComponentTypes,
} from "@minecraft/server";

const blinkProps = {
  blinkCooldownsMap: new Map(),
  blinkCooldownDuration: 2.2, // This must match the full animation length in the UI side
  blinkBlurLifetime: 0.95, // How long should the blur last after the player has blink, this is aligned when the player fully closed his eyes
  blinkWaitLifetime: 1.25, // How long the full blink wait duration
  notBlinkingLifetime: 8, // How many seconds till player needs to blink again
  maximumBlur: 20, // Maximum blur in seconds before the player blinks
};

// Had to make a function because it might get repetetive later on...
const resetBlur = (player) => {
  const playerBlinkProps = getPlayerBlinkProps(player);

  player.onScreenDisplay.setTitle("iwnt_blur_0");
  playerBlinkProps.blinkTime = blinkProps.notBlinkingLifetime;
  blinkProps.blinkCooldownsMap.set(player.id, playerBlinkProps);
};

const getPlayerBlinkProps = (player) =>
  blinkProps.blinkCooldownsMap.get(player.id) || {
    needsReset: false,
    isFullyBlinked: false,
    lastUsed: 0,
    blinkTime: blinkProps.notBlinkingLifetime,
  };

function playerBlink(player) {
  const playerId = player.id;
  const timeNow = system.currentTick;
  const playerBlinkProps = getPlayerBlinkProps(player);

  if (
    timeNow - playerBlinkProps.lastUsed >=
    blinkProps.blinkCooldownDuration * TicksPerSecond
  ) {
    player.onScreenDisplay.setTitle("iwnt_blink_1");
    system.runTimeout(() => {
      player.onScreenDisplay.setTitle("iwnt_blink_0");
    }, blinkProps.blinkCooldownDuration * TicksPerSecond);
    system.runTimeout(() => {
      playerBlinkProps.isFullyBlinked = true;
      resetBlur(player);
    }, blinkProps.blinkBlurLifetime * TicksPerSecond);
    system.runTimeout(
      () => (playerBlinkProps.isFullyBlinked = false),
      blinkProps.blinkWaitLifetime * TicksPerSecond
    );
    playerBlinkProps.lastUsed = timeNow;
  }

  blinkProps.blinkCooldownsMap.set(playerId, playerBlinkProps);
}

system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const playerBlinkProps = getPlayerBlinkProps(player);
    const blinkTime = playerBlinkProps.blinkTime;

    if (playerBlinkProps.needsReset) return;

    const maximumBlur = blinkProps.maximumBlur - 1; // We don't want to fully blacken the player screen
    if (blinkTime < -maximumBlur) {
      playerBlink(player);
      return;
    }

    playerBlinkProps.blinkTime--;
    if (blinkTime <= 0) {
      player.onScreenDisplay.setTitle(
        `iwnt_blur_${Math.abs(blinkTime)}_${blinkProps.maximumBlur}`
      );
    }

    blinkProps.blinkCooldownsMap.set(player.id, playerBlinkProps);
  });
}, TicksPerSecond);

// Needs to be in another interval since the other one runs every seconds leading for it to be delayed
system.runInterval(() => {
  world.getAllPlayers().forEach((player) => {
    const playerBlinkProps = getPlayerBlinkProps(player);

    const playerHealth = player.getComponent(
      EntityComponentTypes.Health
    ).currentValue;

    if (
      player.getGameMode() !== GameMode.survival ||
      player.isSleeping ||
      playerHealth <= 0
    ) {
      playerBlinkProps.needsReset = true;
      resetBlur(player);
      return;
    }

    playerBlinkProps.needsReset = false;

    // Reset the blur if the blinkTime is also resetted
    // This prevents the blur from showing after /reload
    if (
      playerBlinkProps.lastUsed === 0 &&
      playerBlinkProps.blinkTime === blinkProps.notBlinkingLifetime
    )
      resetBlur(player);
  });
});

world.afterEvents.itemUse.subscribe((data) => {
  const { itemStack, source } = data;

  if (itemStack.typeId === "minecraft:compass") playerBlink(source);
});
