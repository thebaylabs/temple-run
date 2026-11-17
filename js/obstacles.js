// obstacles.js — Jump obstacle manager for Annakut Family Path V1
// 4 obstacle types: instagram, tiktok, bottle, cigarette

// key  = image in the Assets manifest
// src  = [x, y, w, h] of the artwork inside its 1856×2304 PNG
// drawH = height on screen; width/height = fallback rectangle art size
const OBSTACLE_DEFS = {
  instagram: { key: 'OBS_INSTAGRAM', src: [345, 173, 1213, 1910], drawH: 104, width: 52, height: 100 },
  tiktok:    { key: 'OBS_TIKTOK',    src: [252, 13,  1375, 2256], drawH: 104, width: 48, height: 100 },
  bottle:    { key: 'OBS_BOTTLE',    src: [374, 148, 1109, 2080], drawH: 104, width: 38, height: 100 },
  cigarette: { key: 'OBS_CIGARETTE', src: [461, 45,  1008, 2241], drawH: 112, width: 44, height: 100 },
};

// One forgiving hitbox for every obstacle: the solid lower core of the art.
// A jump clears it once the player's feet are above OBSTACLE_HIT_H.
const OBSTACLE_HIT_W = 28;
const OBSTACLE_HIT_H = 54;

const Obstacles = (() => {
  let obstacles = [];

  // ── helpers ───────────────────────────────────────────────────────────────

  function _drawInstagram(ctx, sx, groundY) {
    const def = OBSTACLE_DEFS.instagram;
    const w = def.width, h = def.height;
    // pedestal
    ctx.fillStyle = '#FF0080';
    ctx.fillRect(sx - w / 2, groundY - 18, w, 18);
    // main rect
    ctx.fillStyle = '#E1306C';
    ctx.fillRect(sx - w / 2, groundY - h, w, h - 18);
    // white camera icon (simplified)
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const cx = sx, cy = groundY - h / 2 - 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E1306C';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    // viewfinder corner dots
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(sx + 12, groundY - h + 8, 4, 4);
  }

  function _drawTiktok(ctx, sx, groundY) {
    const def = OBSTACLE_DEFS.tiktok;
    const w = def.width, h = def.height;
    // dark base
    ctx.fillStyle = '#111';
    ctx.fillRect(sx - w / 2, groundY - 16, w, 16);
    // body
    ctx.fillStyle = '#000000';
    ctx.fillRect(sx - w / 2, groundY - h, w, h - 16);
    // cyan accent stripe left
    ctx.fillStyle = '#00F2EA';
    ctx.fillRect(sx - w / 2 + 4, groundY - h + 20, 4, 60);
    // pink accent stripe right
    ctx.fillStyle = '#FF0050';
    ctx.fillRect(sx + w / 2 - 8, groundY - h + 20, 4, 60);
    // musical note (simplified)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♪', sx, groundY - h / 2 + 8);
  }

  function _drawBottle(ctx, sx, groundY) {
    const def = OBSTACLE_DEFS.bottle;
    const w = def.width, h = def.height;
    // cracked gray base
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - w / 2, groundY - 20, w, 20);
    // crack lines on base
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - 6, groundY - 20); ctx.lineTo(sx - 2, groundY);
    ctx.moveTo(sx + 4, groundY - 18); ctx.lineTo(sx + 8, groundY);
    ctx.stroke();
    // bottle body — dark brown
    ctx.fillStyle = '#3E1F00';
    ctx.fillRect(sx - w / 2, groundY - h, w, h - 20);
    // bottle neck (narrower)
    const neckW = 14;
    ctx.fillRect(sx - neckW / 2, groundY - h - 16, neckW, 16);
    // white skull on front
    const skullY = groundY - h + 30 + (h - 20) / 2 - 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, skullY, 10, 0, Math.PI * 2);
    ctx.fill();
    // skull eyes
    ctx.fillStyle = '#3E1F00';
    ctx.fillRect(sx - 7, skullY - 2, 4, 4);
    ctx.fillRect(sx + 3, skullY - 2, 4, 4);
    // skull teeth
    ctx.fillStyle = '#3E1F00';
    ctx.fillRect(sx - 6, skullY + 6, 3, 3);
    ctx.fillRect(sx - 2, skullY + 6, 3, 3);
    ctx.fillRect(sx + 2, skullY + 6, 3, 3);
  }

  function _drawCigarette(ctx, sx, groundY, animTick) {
    const def = OBSTACLE_DEFS.cigarette;
    const w = def.width, h = def.height;
    // base with red X
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(sx - w / 2, groundY - 20, w, 20);
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 10, groundY - 16); ctx.lineTo(sx + 10, groundY - 4);
    ctx.moveTo(sx + 10, groundY - 16); ctx.lineTo(sx - 10, groundY - 4);
    ctx.stroke();
    // pack body — white/gray
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(sx - w / 2, groundY - h, w, h - 20);
    // pack label lines
    ctx.fillStyle = '#BBBBBB';
    ctx.fillRect(sx - w / 2 + 4, groundY - h + 10, w - 8, 4);
    ctx.fillRect(sx - w / 2 + 4, groundY - h + 18, w - 8, 4);
    // smoke puffs (3 circles, bobbing with animTick)
    const puffBob = Math.sin((animTick || 0) * 0.08) * 3;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#AAAAAA';
    // puff 1 r=12
    ctx.beginPath();
    ctx.arc(sx - 6, groundY - h - 14 + puffBob, 12, 0, Math.PI * 2);
    ctx.fill();
    // puff 2 r=16
    ctx.beginPath();
    ctx.arc(sx + 4, groundY - h - 28 + puffBob * 1.3, 16, 0, Math.PI * 2);
    ctx.fill();
    // puff 3 r=10
    ctx.beginPath();
    ctx.arc(sx + 14, groundY - h - 44 + puffBob * 0.7, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // ── public API ────────────────────────────────────────────────────────────

  function init() {
    obstacles = [];
    if (typeof CONFIG === 'undefined' || !CONFIG.WORLD_EVENTS) return;
    CONFIG.WORLD_EVENTS.forEach(ev => {
      if (ev.type === 'obstacle') {
        const def = OBSTACLE_DEFS[ev.id];
        if (!def) return;
        obstacles.push({
          worldX:  ev.worldX,
          id:      ev.id,
          width:   def.width,
          height:  def.height,
          cleared: false,
        });
      }
    });
  }

  function reset() {
    init();
  }

  /** World X of every obstacle the player has not hit yet. */
  function getActivePositions() {
    return obstacles.filter(o => !o.cleared).map(o => o.worldX);
  }

  /**
   * render(ctx, cameraX, getGroundY, animTick)
   * Draws all non-cleared obstacles visible on screen, using the PNG art
   * when it has loaded and the hand-drawn version otherwise.
   */
  function render(ctx, cameraX, getGroundY, animTick) {
    const WIDTH = CONFIG.WIDTH;
    const tick = animTick || 0;
    obstacles.forEach(obs => {
      if (obs.cleared) return;
      const sx = Math.round(obs.worldX - cameraX);
      if (sx < -120 || sx > WIDTH + 120) return;
      const groundY = getGroundY(obs.worldX);
      const def = OBSTACLE_DEFS[obs.id];
      const img = Assets.sprite(def.key, def.src, def.drawH);

      ctx.save();
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(sx - 30, groundY - 2, 60, 6);

      let topY;
      if (img) {
        topY = groundY - img.height + 4;
        ctx.drawImage(img, sx - Math.round(img.width / 2), topY);
      } else {
        topY = groundY - def.height - 20;
        switch (obs.id) {
          case 'instagram': _drawInstagram(ctx, sx, groundY); break;
          case 'tiktok':    _drawTiktok(ctx, sx, groundY);    break;
          case 'bottle':    _drawBottle(ctx, sx, groundY);    break;
          case 'cigarette': _drawCigarette(ctx, sx, groundY, tick); break;
        }
      }

      // Bouncing "jump!" arrow above the obstacle so it reads as a hazard,
      // not as scenery.
      const bob = Math.round(Math.sin(tick * 0.25) * 4);
      const ay = topY - 22 + bob;
      ctx.fillStyle = '#000000';
      ctx.fillRect(sx - 5, ay - 2, 10, 12);
      ctx.fillRect(sx - 11, ay + 8, 22, 4);
      ctx.fillRect(sx - 7, ay + 12, 14, 4);
      ctx.fillRect(sx - 3, ay + 16, 6, 4);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(sx - 3, ay, 6, 10);
      ctx.fillRect(sx - 9, ay + 8, 18, 2);
      ctx.fillRect(sx - 7, ay + 10, 14, 2);
      ctx.fillRect(sx - 5, ay + 12, 10, 2);
      ctx.fillRect(sx - 3, ay + 14, 6, 2);
      ctx.fillRect(sx - 1, ay + 16, 2, 2);
      ctx.restore();
    });
  }

  /**
   * checkPlayerCollision(playerWorldX, playerJumpYOffset, groundY)
   * playerWorldX is the LEFT edge of the player sprite (same as Game.worldX).
   * playerJumpYOffset: negative = up (e.g. -140 at the peak of a jump).
   * Returns the collided obstacle (and marks it cleared) or null.
   */
  function checkPlayerCollision(playerWorldX, playerJumpYOffset, groundY) {
    const pCentre = playerWorldX + CONFIG.PLAYER_W / 2;
    const pLeft   = pCentre - 12;
    const pRight  = pCentre + 12;
    const feetY   = groundY + playerJumpYOffset;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.cleared) continue;

      const obsLeft  = obs.worldX - OBSTACLE_HIT_W / 2;
      const obsRight = obs.worldX + OBSTACLE_HIT_W / 2;
      const obsTop   = groundY - OBSTACLE_HIT_H;

      const xOverlap = pRight > obsLeft && pLeft < obsRight;
      const feetBelowTop = feetY > obsTop;

      if (xOverlap && feetBelowTop) {
        obs.cleared = true;
        return obs;
      }
    }
    return null;
  }

  return { init, reset, render, checkPlayerCollision, getActivePositions };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Obstacles;
}
