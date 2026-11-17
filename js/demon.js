// demon.js — Social Media Demon "Vikshep" for Annakut Family Path V1.1
//
// The demon keeps a target distance behind the player that tightens with
// every question answered, so it is always on screen breathing down the
// player's neck. Mistakes let it close in; good answers push it back.

const Demon = (() => {
  // Target gap (px, demon centre → player centre) by questions answered
  const TARGET_GAP   = [210, 190, 170, 150, 135, 120];
  const MISTAKE_GAIN = 40;    // demon closes in this much per mistake
  const GOOD_PUSH    = 40;    // and is pushed back this much per good answer
  const CATCH_GAP    = 45;
  const START_GAP    = 420;   // starts off-screen and runs in

  // Sprite sheet (assets/demon/demon_sheet.png, 3168×1344): [x, y, w, h]
  const SPRITE_H = 112;
  const SPRITE_SCALE = SPRITE_H / 638;
  const FRAMES = {
    runA:    [112,  368, 670, 638],
    runB:    [849,  368, 682, 632],
    lunge:   [1594, 381, 795, 625],
    retreat: [2459, 377, 599, 630],
  };

  // ── state ─────────────────────────────────────────────────────────────────
  let gap          = START_GAP;
  let penalty      = 0;       // accumulated closeness from mistakes
  let retreatTimer = 0;
  let banished     = false;
  let fade         = 1;
  let animTick     = 0;
  let demonWorldX  = -START_GAP;

  function init() {
    gap          = START_GAP;
    penalty      = 0;
    retreatTimer = 0;
    banished     = false;
    fade         = 1;
    animTick     = 0;
    demonWorldX  = -START_GAP;
  }

  /**
   * update(playerWorldX, questionsAnswered, playerInvincible)
   * playerWorldX is the left edge of the player sprite.
   * Returns 'caught' if the demon reaches the player, else null.
   */
  function update(playerWorldX, questionsAnswered, playerInvincible) {
    animTick++;
    const playerCentre = playerWorldX + CONFIG.PLAYER_W / 2;

    if (banished) {
      gap += 6;
      fade = Math.max(0, fade - 0.04);
      demonWorldX = playerCentre - gap;
      return null;
    }

    if (retreatTimer > 0) retreatTimer--;

    const q = Math.min(questionsAnswered, TARGET_GAP.length - 1);
    let target = TARGET_GAP[q] - penalty;
    // Never crowd the player while they are still blinking from a hit
    if (playerInvincible) target = Math.max(target, 90);
    gap += (target - gap) * 0.04;
    demonWorldX = playerCentre - gap;

    if (gap <= CATCH_GAP && !playerInvincible) {
      penalty = 0;
      gap = 260;
      demonWorldX = playerCentre - gap;
      return 'caught';
    }
    return null;
  }

  /** Right answer: demon is pushed back. */
  function onPlayerGoodChoice() {
    penalty = Math.max(0, penalty - GOOD_PUSH);
    gap += 70;
    retreatTimer = 30;
  }

  /** Wrong answer or obstacle hit: demon closes in. */
  function onPlayerMistake() {
    penalty += MISTAKE_GAIN;
  }

  // Kept for compatibility with older callers
  function onPlayerBadChoice() { onPlayerMistake(); }
  function onPlayerHit() { onPlayerMistake(); }

  /** Temple reached: demon falls away and fades out. */
  function banish() {
    banished = true;
    retreatTimer = 9999;
  }

  function getDemonWorldX() {
    return demonWorldX;
  }

  function getWarningLevel() {
    if (banished) return 0;
    if (gap < 100) return 2;
    if (gap < 140) return 1;
    return 0;
  }

  // ── rendering ─────────────────────────────────────────────────────────────

  function render(ctx, cameraX, getGroundY) {
    if (fade <= 0) return;
    const sx = Math.round(demonWorldX - cameraX);
    if (sx < -120 || sx > CONFIG.WIDTH + 60) return;
    const groundY = getGroundY(demonWorldX);

    let name;
    if (retreatTimer > 0) name = 'retreat';
    else if (gap < 105) name = 'lunge';
    else name = (Math.floor(animTick / 4) % 2 === 0) ? 'runA' : 'runB';

    const r = FRAMES[name];
    const sprite = Assets.sprite('DEMON_SHEET', r, r[3] * SPRITE_SCALE);

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(sx - 32, groundY - 2, 64, 6);

    if (sprite) {
      const bob = (name === 'runA' || name === 'runB') ? (Math.floor(animTick / 4) % 2) * 2 : 0;
      ctx.drawImage(sprite, Math.round(sx - sprite.width / 2), groundY - sprite.height + 3 - bob);
    } else {
      drawFallback(ctx, sx, groundY);
    }
    ctx.restore();
  }

  /** Simple hand-drawn demon used if demon_sheet.png is missing. */
  function drawFallback(ctx, sx, groundY) {
    const DW = 52, DH = 100;
    const step = (Math.floor(animTick / 5) % 2 === 0) ? 1 : -1;
    ctx.fillStyle = '#2A004A';
    ctx.fillRect(sx - DW / 2 - 4, groundY - DH - 10, DW + 8, DH - 14);
    ctx.fillStyle = '#4A0070';
    ctx.fillRect(sx - DW / 2, groundY - DH, DW, DH - 30);
    ctx.fillRect(sx - 16, groundY - 32 + step * 5, 14, 32);
    ctx.fillRect(sx + 2,  groundY - 32 - step * 5, 14, 32);
    ctx.fillRect(sx + DW / 2, groundY - DH + 10 - step * 6, 10, 28);
    ctx.fillStyle = '#00F2EA';
    ctx.fillRect(sx + DW / 2 + 2, groundY - DH + 30 - step * 6, 12, 20);
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(sx - 14, groundY - DH + 18, 10, 8);
    ctx.fillRect(sx + 4,  groundY - DH + 18, 10, 8);
  }

  return {
    init,
    update,
    onPlayerGoodChoice,
    onPlayerBadChoice,
    onPlayerMistake,
    onPlayerHit,
    banish,
    getDemonWorldX,
    get warningLevel() { return getWarningLevel(); },
    render,
  };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Demon;
}
