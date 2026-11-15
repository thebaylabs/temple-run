// demon.js — Social Media Demon "Vikshep" for Annakut Family Path V1

const Demon = (() => {
  const PHASE_MULTIPLIERS = [0.85, 0.90, 0.94, 0.97];

  // ── state ─────────────────────────────────────────────────────────────────
  let demonWorldX   = -480;
  let phase         = 0;
  let retreatTimer  = 0;
  let caughtPlayer  = false;
  let animTick      = 0;
  let _playerWorldX = 0; // stored for warningLevel

  // ── init / reset ──────────────────────────────────────────────────────────

  function init() {
    demonWorldX  = -480;
    phase        = 0;
    retreatTimer = 0;
    caughtPlayer = false;
    animTick     = 0;
    _playerWorldX = 0;
  }

  // ── lifecycle ─────────────────────────────────────────────────────────────

  /**
   * update(playerWorldX, playerSpeed, questionsAnswered)
   * Returns 'caught' if demon catches player, else null.
   */
  function update(playerWorldX, playerSpeed, questionsAnswered) {
    _playerWorldX = playerWorldX;
    animTick++;

    phase = Math.min(questionsAnswered, 3);
    const demonSpeed = playerSpeed * PHASE_MULTIPLIERS[phase];

    if (retreatTimer > 0) {
      retreatTimer--;
      demonWorldX += demonSpeed * 0.5;
    } else {
      demonWorldX += demonSpeed;
    }

    const gap = playerWorldX - demonWorldX;

    if (gap < 20 && retreatTimer === 0) {
      // Caught — reset demon position but signal the event
      demonWorldX = playerWorldX - 480;
      caughtPlayer = true;
      return 'caught';
    }

    caughtPlayer = false;
    return null;
  }

  function onPlayerGoodChoice() {
    demonWorldX   -= 80;
    retreatTimer   = 25;
  }

  function onPlayerBadChoice() {
    demonWorldX += 150;
  }

  /**
   * onPlayerHit(playerWorldX)
   * Called when player loses a life to an obstacle.
   */
  function onPlayerHit(playerWorldX) {
    if (typeof playerWorldX === 'number') {
      demonWorldX = playerWorldX - 480;
    } else {
      demonWorldX -= 300;
    }
  }

  function storePlayerX(x) {
    _playerWorldX = x;
  }

  function getDemonWorldX() {
    return demonWorldX;
  }

  // ── warning level ─────────────────────────────────────────────────────────

  function getWarningLevel() {
    const gap = _playerWorldX - demonWorldX;
    if (gap < 150) return 2;
    if (gap < 300) return 1;
    return 0;
  }

  // ── rendering ─────────────────────────────────────────────────────────────

  /**
   * render(ctx, cameraX, getGroundY)
   */
  function render(ctx, cameraX, getGroundY) {
    const WIDTH   = (window.CONFIG && CONFIG.WIDTH)  ? CONFIG.WIDTH  : 960;
    const sx      = demonWorldX - cameraX;

    if (sx < -60 || sx > WIDTH + 30) return;

    const groundY = getGroundY(demonWorldX);
    const DW      = 52;   // demon body width
    const DH      = 100;  // demon body height

    // 4-frame running: arms/legs swap every 5 ticks
    const runFrame = Math.floor(animTick / 5) % 4;

    // Eye pulse
    const eyeAlpha = 0.7 + 0.3 * Math.sin(animTick * 0.15);

    ctx.save();

    // Retreat: scale smaller and fade
    if (retreatTimer > 0) {
      ctx.globalAlpha = 0.6;
      ctx.translate(sx, groundY);
      ctx.scale(0.85, 0.85);
      ctx.translate(-sx, -groundY);
    }

    // ── Dark flowing cloak (behind body) ─────────────────────────────────
    // 3 dark rects slightly offset for jagged cloak bottom
    ctx.fillStyle = '#2A004A';
    ctx.fillRect(sx - DW / 2 - 4, groundY - DH - 10, DW + 8, DH + 10);
    ctx.fillStyle = '#1A0030';
    ctx.fillRect(sx - DW / 2 - 2 + runFrame, groundY - 24, 14, 24);
    ctx.fillRect(sx - DW / 2 + 10,           groundY - 20, 12, 20);
    ctx.fillRect(sx - DW / 2 + 22 - runFrame, groundY - 22, 14, 22);

    // ── Main body ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#4A0070';
    ctx.fillRect(sx - DW / 2, groundY - DH, DW, DH);

    // ── Arms / legs animation ─────────────────────────────────────────────
    ctx.fillStyle = '#4A0070';
    // Arms
    const armSwing = (runFrame % 2 === 0) ? 1 : -1;
    ctx.fillRect(sx - DW / 2 - 10, groundY - DH + 10 + armSwing * 6, 10, 28);
    ctx.fillRect(sx + DW / 2,       groundY - DH + 10 - armSwing * 6, 10, 28);
    // Legs
    const legSwing = (runFrame % 2 === 0) ? 1 : -1;
    ctx.fillRect(sx - 16, groundY - 32 + legSwing * 5,  14, 32);
    ctx.fillRect(sx + 2,  groundY - 32 - legSwing * 5,  14, 32);

    // ── Cyan glowing phone in right hand ─────────────────────────────────
    const phoneX = sx + DW / 2 + 2;
    const phoneY = groundY - DH + 30 - armSwing * 6;
    // glow
    ctx.shadowBlur  = 12;
    ctx.shadowColor = '#00F2EA';
    ctx.fillStyle   = '#00F2EA';
    ctx.fillRect(phoneX, phoneY, 12, 20);
    ctx.shadowBlur  = 0;
    ctx.shadowColor = 'transparent';
    // screen glint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(phoneX + 2, phoneY + 2, 4, 6);

    // ── Glowing eyes ─────────────────────────────────────────────────────
    ctx.globalAlpha = (retreatTimer > 0) ? 0.6 * eyeAlpha : eyeAlpha;
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#FF00FF';
    ctx.fillStyle   = '#FF00FF';
    ctx.fillRect(sx - 14, groundY - DH + 18, 10, 8);
    ctx.fillRect(sx + 4,  groundY - DH + 18, 10, 8);
    ctx.shadowBlur  = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = (retreatTimer > 0) ? 0.6 : 1.0;

    // ── 3 floating notification icons ─────────────────────────────────────
    const icons = [
      { dx: -18, dy: -28, sym: '♥', color: '#FF4D88' },
      { dx:  20, dy: -40, sym: '🔔', color: '#FFD700' },
      { dx:  -4, dy: -54, sym: '👍', color: '#4FC3F7' },
    ];
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    icons.forEach((ic, i) => {
      const bobY = Math.sin(animTick * 0.12 + i * 1.2) * 5;
      ctx.fillStyle = ic.color;
      ctx.fillText(ic.sym, sx + ic.dx, groundY - DH + ic.dy + bobY);
    });

    ctx.restore();
  }

  // ── public API ────────────────────────────────────────────────────────────

  return {
    init,
    update,
    onPlayerGoodChoice,
    onPlayerBadChoice,
    onPlayerHit,
    storePlayerX,
    getDemonWorldX,
    get warningLevel() { return getWarningLevel(); },
    render,
  };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Demon;
}
