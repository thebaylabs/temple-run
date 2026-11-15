// obstacles.js — Jump obstacle manager for Annakut Family Path V1
// 4 obstacle types: instagram, tiktok, bottle, cigarette

const OBSTACLE_DEFS = {
  instagram: { width: 52, height: 110 },
  tiktok:    { width: 48, height: 110 },
  bottle:    { width: 38, height: 120 },
  cigarette: { width: 44, height: 130 },
};

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
    if (!window.CONFIG || !CONFIG.WORLD_EVENTS) return;
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

  /**
   * render(ctx, cameraX, getGroundY)
   * Draws all non-cleared obstacles visible on screen.
   */
  function render(ctx, cameraX, getGroundY, animTick) {
    const WIDTH = (window.CONFIG && CONFIG.WIDTH) ? CONFIG.WIDTH : 960;
    obstacles.forEach(obs => {
      if (obs.cleared) return;
      const sx = obs.worldX - cameraX;
      if (sx < -obs.width - 10 || sx > WIDTH + obs.width + 10) return;
      const groundY = getGroundY(obs.worldX);

      ctx.save();
      switch (obs.id) {
        case 'instagram': _drawInstagram(ctx, sx, groundY); break;
        case 'tiktok':    _drawTiktok(ctx, sx, groundY);    break;
        case 'bottle':    _drawBottle(ctx, sx, groundY);    break;
        case 'cigarette': _drawCigarette(ctx, sx, groundY, animTick || 0); break;
      }
      ctx.restore();
    });
  }

  /**
   * checkPlayerCollision(playerWorldX, playerJumpYOffset, groundY)
   * Returns collided obstacle object (and marks it cleared) or null.
   * playerJumpYOffset: negative = up (e.g. -130 at peak of jump)
   */
  function checkPlayerCollision(playerWorldX, playerJumpYOffset, groundY) {
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.cleared) continue;

      // Player AABB
      const pLeft   = playerWorldX - 18;
      const pRight  = playerWorldX + 18;
      const pBottom = groundY;
      const pTop    = groundY - 72 + playerJumpYOffset;

      // Obstacle AABB (using its own groundY via stored worldX — caller passes generic groundY;
      // for per-obstacle groundY accuracy, use the same groundY the caller computed or the render path)
      const obsLeft   = obs.worldX - obs.width / 2;
      const obsRight  = obs.worldX + obs.width / 2;
      const obsBottom = groundY;
      const obsTop    = groundY - obs.height;

      // X overlap
      const xOverlap = pRight > obsLeft && pLeft < obsRight;
      // Y: player is NOT fully above obstacle
      const notAbove = pTop > obsTop;

      if (xOverlap && notAbove) {
        obs.cleared = true;
        return obs;
      }
    }
    return null;
  }

  return { init, reset, render, checkPlayerCollision };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Obstacles;
}
