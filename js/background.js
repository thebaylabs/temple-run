// ============================================================
// BACKGROUND — fully code-drawn pixel-art scenery (no image files)
// V1.1: flat ground, layered parallax per zone, temple staircase finale
//
// How it works
//   Every layer is painted ONCE into an off-screen canvas ("strip") with a
//   seeded random generator, then tiled across the screen each frame at its
//   own scroll speed. Strips wrap perfectly because each one is drawn three
//   times (shifted by -width, 0, +width) when it is built.
//
//   Layer            scroll   content
//   sky              0        gradient + sun (blends between zones)
//   clouds           0.06     drifting clouds
//   hills            0.10     two hazy ranges
//   skyline          0.20     distant mandir spires
//   mid (per zone)   0.50     the zone's main architecture / gardens
//   near (per zone)  0.80     hedges, railings, lamp posts
//   ground (zone)    1.00     paved path + front verge
//   stairs + temple  1.00     the finale
// ============================================================
const Background = (() => {
    let animTick = 0;
    let built = false;

    const STRIP_W = 960;
    const MID_H = 280;
    const NEAR_H = 90;
    const GROUND_H = 110;
    const GROUND_TILE_W = 320;
    const TEMPLE_W = 400, TEMPLE_H = 290;

    const strips = { mid: [], near: [], ground: [] };

    // ---------------------------------------------------------------
    // Tiny toolkit
    // ---------------------------------------------------------------

    /** Seeded pseudo-random generator (same scenery every run). */
    function rng(seed) {
        return () => {
            seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /** Filled rectangle snapped to whole pixels. */
    function R(c, col, x, y, w, h) {
        c.fillStyle = col;
        c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    }

    /** Builds a horizontally seamless strip. draw(c, w, h) must be deterministic. */
    function makeStrip(w, h, draw) {
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const c = cv.getContext('2d');
        c.imageSmoothingEnabled = false;
        [-w, 0, w].forEach(dx => {
            c.save();
            c.translate(dx, 0);
            draw(c, w, h);
            c.restore();
        });
        return cv;
    }

    function hexToRgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    function mix(hexA, hexB, t) {
        const a = hexToRgb(hexA), b = hexToRgb(hexB);
        const v = a.map((ch, i) => Math.round(ch + (b[i] - ch) * t));
        return `rgb(${v[0]},${v[1]},${v[2]})`;
    }

    // ---------------------------------------------------------------
    // Reusable pixel-art shapes
    // ---------------------------------------------------------------

    /** Chunky filled circle. */
    function blob(c, col, cx, cy, r) {
        for (let y = -r; y < r; y += 3) {
            const ww = Math.sqrt(Math.max(0, r * r - y * y));
            R(c, col, cx - ww, cy + y, ww * 2, 3);
        }
    }

    /** Half-dome sitting on baseY. */
    function dome(c, col, cx, baseY, r, hi) {
        for (let y = 0; y < r; y += 2) {
            const ww = Math.sqrt(r * r - y * y);
            R(c, col, cx - ww, baseY - y - 2, ww * 2, 2);
            if (hi) R(c, hi, cx - ww * 0.75, baseY - y - 2, ww * 0.3, 2);
        }
    }

    /** Curved North-Indian temple spire. Returns the Y of its tip. */
    function shikhara(c, col, band, cx, baseY, w, h) {
        const n = Math.max(3, Math.floor(h / 4));
        for (let i = 0; i < n; i++) {
            const t = i / n;
            const ww = w * (1 - Math.pow(t, 1.6) * 0.84);
            R(c, col, cx - ww / 2, baseY - (i + 1) * 4, ww, 4);
            if (band && i % 3 === 0) R(c, band, cx - ww / 2, baseY - (i + 1) * 4 + 3, ww, 1);
        }
        if (band) R(c, band, cx - 1, baseY - n * 4, 2, n * 4 - 6);
        const top = baseY - n * 4;
        R(c, col, cx - w * 0.13 - 2, top - 4, w * 0.26 + 4, 4);   // amalaka disc
        R(c, col, cx - 2, top - 9, 4, 5);                          // kalash
        return top - 9;
    }

    function cypress(c, x, baseY, h, light, dark) {
        R(c, '#5B3A1E', x - 2, baseY - 10, 4, 10);
        for (let i = 8; i < h; i += 4) {
            const t = (i - 8) / (h - 8);
            const ww = Math.max(4, 24 * Math.pow(1 - t, 0.7));
            R(c, dark, x - ww / 2, baseY - i - 4, ww, 4);
            R(c, light, x - ww / 2, baseY - i - 4, ww * 0.45, 4);
        }
    }

    function roundTree(c, x, baseY, h, light, dark, bloom, r) {
        R(c, '#6B4226', x - 3, baseY - h * 0.5, 6, h * 0.5);
        R(c, '#54331C', x + 1, baseY - h * 0.5, 2, h * 0.5);
        const rad = h * 0.34;
        blob(c, dark, x, baseY - h * 0.62, rad);
        blob(c, light, x - rad * 0.22, baseY - h * 0.72, rad * 0.68);
        if (bloom) {
            for (let i = 0; i < 12; i++) {
                R(c, bloom, x - rad * 0.8 + r() * rad * 1.6, baseY - h * 0.62 - rad * 0.8 + r() * rad * 1.3, 3, 3);
            }
        }
    }

    /** Small domed pavilion standing on baseY. */
    function chhatri(c, cx, baseY, stone, light, s) {
        const w = 34 * s, ph = 26 * s;
        R(c, stone, cx - w / 2, baseY - ph, 4 * s, ph);
        R(c, stone, cx + w / 2 - 4 * s, baseY - ph, 4 * s, ph);
        R(c, stone, cx - 2 * s, baseY - ph, 4 * s, ph);
        R(c, light, cx - w / 2 - 4 * s, baseY - ph - 5 * s, w + 8 * s, 5 * s);
        dome(c, light, cx, baseY - ph - 5 * s, w * 0.46, null);
        R(c, '#FFD24A', cx - 1, baseY - ph - 5 * s - w * 0.46 - 7, 3, 7);
    }

    function lampPost(c, x, baseY, h) {
        R(c, '#3B2F2F', x - 4, baseY - 6, 10, 6);
        R(c, '#4A3B3B', x - 1, baseY - h, 4, h - 6);
        R(c, '#6B5757', x - 1, baseY - h, 1, h - 6);
        R(c, '#3B2F2F', x - 6, baseY - h - 3, 14, 3);
        R(c, '#E0A526', x - 5, baseY - h - 17, 12, 14);
        R(c, '#FFF1A8', x - 2, baseY - h - 14, 6, 8);
        R(c, '#3B2F2F', x - 3, baseY - h - 21, 8, 4);
        R(c, '#3B2F2F', x, baseY - h - 24, 2, 3);
    }

    /** Many-tiered brass lamp tower (deep-stambh). */
    function diyaStand(c, x, baseY, h) {
        R(c, '#8A5A1C', x - 8, baseY - 5, 18, 5);
        R(c, '#B77A26', x - 1, baseY - h, 4, h - 5);
        for (let y = baseY - 16; y > baseY - h; y -= 14) {
            const w = 8 + (y - (baseY - h)) / h * 16;
            R(c, '#D9A520', x + 1 - w / 2, y, w, 3);
            R(c, '#FF9D00', x + 1 - w / 2, y - 4, 3, 4);
            R(c, '#FF9D00', x + w / 2 - 2, y - 4, 3, 4);
            R(c, '#FFF3B0', x + 2 - w / 2, y - 3, 1, 2);
            R(c, '#FFF3B0', x + w / 2 - 1, y - 3, 1, 2);
        }
        R(c, '#FF9D00', x - 1, baseY - h - 6, 4, 6);
        R(c, '#FFF3B0', x, baseY - h - 4, 2, 3);
    }

    /** 30×20 elephant facing right, for carved friezes. */
    function elephant(c, x, y, body, shade) {
        R(c, body, x + 5, y + 4, 18, 10);
        R(c, body, x + 21, y + 2, 8, 9);
        R(c, body, x + 27, y + 9, 3, 8);
        R(c, body, x + 29, y + 15, 3, 2);
        R(c, body, x + 6, y + 13, 4, 7);
        R(c, body, x + 17, y + 13, 4, 7);
        R(c, shade, x + 19, y + 4, 4, 6);
        R(c, shade, x + 3, y + 6, 2, 6);
        R(c, shade, x + 9, y + 3, 10, 2);
    }

    /** Saffron pennant on a pole. pole base at (x, baseY). */
    function flagPole(c, x, baseY, h) {
        R(c, '#7A5230', x - 1, baseY - h, 3, h);
        R(c, '#FFD24A', x - 2, baseY - h - 4, 5, 4);
        R(c, '#FF7A1A', x + 2, baseY - h + 2, 22, 5);
        R(c, '#FF7A1A', x + 2, baseY - h + 7, 16, 4);
        R(c, '#FF7A1A', x + 2, baseY - h + 11, 9, 4);
        R(c, '#FFA24D', x + 2, baseY - h + 2, 22, 1);
    }

    // ---------------------------------------------------------------
    // Shared far layers
    // ---------------------------------------------------------------

    function drawClouds(c, w, h) {
        const r = rng(9);
        for (let i = 0; i < 12; i++) {
            const x = r() * w, y = 14 + r() * (h - 60), s = 0.7 + r() * 1.0;
            const cw = 76 * s, ch = 14 * s;
            R(c, '#FFFFFF', x, y + ch * 0.7, cw, ch);
            R(c, '#FFFFFF', x + cw * 0.12, y + ch * 0.2, cw * 0.36, ch * 0.6);
            R(c, '#FFFFFF', x + cw * 0.40, y - ch * 0.25, cw * 0.34, ch);
            R(c, '#FFFFFF', x + cw * 0.48, y - ch * 0.55, cw * 0.18, ch * 0.4);
            R(c, '#FFFFFF', x + cw * 0.70, y + ch * 0.3, cw * 0.2, ch * 0.5);
            R(c, '#DCEAF7', x + 4, y + ch * 1.45, cw - 8, ch * 0.25);
            R(c, '#EEF5FC', x + cw * 0.15, y + ch * 1.2, cw * 0.6, ch * 0.25);
        }
    }

    function drawHills(c, w, h) {
        const ranges = [
            ['#A9C6D8', '#B9D2E0', 150, 44, 2, 5, 0.3],
            ['#8FB3AE', '#9DBFB8', 104, 32, 3, 7, 1.7],
        ];
        ranges.forEach(([col, hi, base, amp, k1, k2, ph]) => {
            for (let x = 0; x < w; x += 4) {
                const a = x / w * Math.PI * 2;
                let y = base + amp * Math.sin(a * k1 + ph) + amp * 0.4 * Math.sin(a * k2 + ph * 2);
                y = Math.round(y / 4) * 4;
                R(c, col, x, h - y, 4, y);
                R(c, hi, x, h - y, 4, 4);
            }
        });
    }

    function drawSkyline(c, w, h) {
        const r = rng(77);
        const col = '#C9B79F', band = '#B8A48A';
        R(c, col, 0, h - 40, w, 40);
        R(c, band, 0, h - 40, w, 2);
        let x = 30;
        while (x < w - 60) {
            const k = r();
            if (k < 0.45) {
                const bw = 58 + r() * 30, bh = 120 + r() * 80;
                const tip = shikhara(c, col, band, x + bw / 2, h - 38, bw, bh);
                R(c, band, x + bw / 2, tip - 14, 1, 14);
                R(c, '#E8A265', x + bw / 2 + 1, tip - 14, 10, 5);
                shikhara(c, col, band, x + bw / 2 - bw * 0.62, h - 38, bw * 0.5, bh * 0.55);
                shikhara(c, col, band, x + bw / 2 + bw * 0.62, h - 38, bw * 0.5, bh * 0.55);
                x += bw * 1.75 + 20 + r() * 40;
            } else if (k < 0.75) {
                const rad = 22 + r() * 14;
                R(c, col, x, h - 38 - 44, rad * 2, 44);
                for (let wx = x + 6; wx < x + rad * 2 - 6; wx += 12) R(c, band, wx, h - 70, 5, 14);
                dome(c, col, x + rad, h - 82, rad, null);
                R(c, col, x + rad - 1, h - 82 - rad - 10, 3, 10);
                x += rad * 2 + 24 + r() * 40;
            } else {
                for (let i = 0; i < 3; i++) shikhara(c, col, band, x + 14 + i * 30, h - 38, 22, 54 + r() * 34);
                x += 112 + r() * 30;
            }
        }
    }

    // ---------------------------------------------------------------
    // Zone 0 — Garden Gate: boundary wall, tall trees, the entrance gate
    // ---------------------------------------------------------------
    function midGarden(c, w, h) {
        const r = rng(101);
        for (let x = 10; x < w; x += 46) {
            const th = 120 + Math.floor(r() * 70);
            if (r() < 0.55) cypress(c, x, h - 60, th, '#3C8236', '#27602A');
            else roundTree(c, x, h - 60, th * 0.85, '#4C9A3A', '#2F6B28', r() < 0.4 ? '#F9A8D4' : null, r);
        }

        const wy = h - 92;
        R(c, '#D8B888', 0, wy, w, 92);
        for (let y = wy + 24; y < h - 12; y += 16) R(c, '#CDAB79', 0, y, w, 1);
        R(c, '#C39F6E', 0, h - 12, w, 12);
        R(c, '#AE8A58', 0, h - 3, w, 3);
        R(c, '#EBD3A8', 0, wy, w, 5);
        R(c, '#B8935F', 0, wy + 5, w, 2);
        for (let x = 0; x < w; x += 16) {           // pointed merlons
            R(c, '#EBD3A8', x + 2, wy - 8, 10, 8);
            R(c, '#EBD3A8', x + 5, wy - 11, 4, 3);
            R(c, '#D8B888', x + 9, wy - 7, 3, 7);
        }
        for (let x = 0; x < w; x += 8) R(c, '#B8935F', x + 2, wy + 11, 4, 4);   // carved band
        for (let x = 0; x < w; x += 96) {
            R(c, '#C9A574', x, wy + 7, 10, 73);      // pilaster
            R(c, '#E6CB9C', x + 1, wy + 7, 2, 73);
            R(c, '#EBD3A8', x - 2, wy + 7, 14, 4);
            const nx = x + 30, ny = wy + 22;         // arched jali niche
            R(c, '#A9834F', nx, ny + 8, 46, 44);
            R(c, '#A9834F', nx + 4, ny + 4, 38, 4);
            R(c, '#A9834F', nx + 10, ny, 26, 4);
            for (let jy = ny + 12; jy < ny + 50; jy += 6) {
                for (let jx = nx + 4; jx < nx + 44; jx += 6) R(c, '#7A5A30', jx, jy, 3, 3);
            }
            R(c, '#EBD3A8', nx - 2, ny + 52, 50, 3);
            R(c, '#C39F6E', nx - 2, ny + 55, 50, 2);
        }

        // The entrance gate (once per strip)
        const cx = 480;
        R(c, '#8FBF73', cx - 50, h - 122, 100, 122);        // garden glimpse
        R(c, '#B9E0A0', cx - 50, h - 122, 100, 40);
        R(c, '#6FA35A', cx - 50, h - 44, 100, 44);
        R(c, '#D9C39A', cx - 14, h - 44, 28, 44);           // path through the gate
        roundTree(c, cx - 30, h - 40, 60, '#4C9A3A', '#2F6B28', null, r);
        roundTree(c, cx + 32, h - 40, 52, '#4C9A3A', '#2F6B28', '#FDE047', r);
        [-1, 1].forEach(s => {
            const tx = cx + s * 72 - 22;
            R(c, '#CFAE7C', tx, h - 176, 44, 176);
            R(c, '#E6CB9C', tx, h - 176, 4, 176);
            R(c, '#B08A58', tx + 38, h - 176, 6, 176);
            for (let y = h - 160; y < h - 20; y += 28) {
                R(c, '#B8935F', tx + 4, y, 34, 3);
                R(c, '#E6CB9C', tx + 4, y + 3, 34, 1);
                R(c, '#A9834F', tx + 16, y + 10, 12, 12);
                R(c, '#7A5A30', tx + 19, y + 13, 6, 6);
            }
            R(c, '#EBD3A8', tx - 4, h - 182, 52, 8);
            R(c, '#B8935F', tx - 4, h - 175, 52, 2);
            chhatri(c, tx + 22, h - 182, '#C9A574', '#EBD3A8', 1.1);
        });
        R(c, '#CFAE7C', cx - 50, h - 152, 100, 34);
        for (let i = 0; i < 5; i++) {                       // scalloped arch
            const lx = cx - 50 + i * 20;
            R(c, '#B9E0A0', lx + 3, h - 123, 14, 5);
            R(c, '#B9E0A0', lx + 6, h - 127, 8, 4);
        }
        R(c, '#EBD3A8', cx - 56, h - 158, 112, 8);
        R(c, '#B8935F', cx - 56, h - 151, 112, 2);
        for (let x = cx - 48; x < cx + 48; x += 8) R(c, '#B8935F', x + 2, h - 144, 4, 4);
        for (let i = 0; i < 16; i++) {                      // marigold toran
            R(c, i % 2 ? '#F59E0B' : '#15803D', cx - 48 + i * 6, h - 118 + (i % 4 < 2 ? 0 : 3), 5, 5);
        }
        dome(c, '#E9C58F', cx, h - 158, 26, '#F6E0B8');
        R(c, '#FFD24A', cx - 2, h - 196, 4, 12);
        flagPole(c, cx, h - 196, 26);
    }

    function nearGarden(c, w, h) {
        const r = rng(111);
        R(c, '#2E7D32', 0, h - 26, w, 26);
        R(c, '#256628', 0, h - 8, w, 8);
        for (let x = 0; x < w; x += 20) {
            R(c, '#2E7D32', x + 2, h - 31, 16, 5);
            R(c, '#43A047', x + 4, h - 30, 8, 2);
        }
        for (let i = 0; i < 160; i++) R(c, r() < 0.5 ? '#43A047' : '#1F5A24', r() * w, h - 26 + r() * 22, 3, 2);
        for (let i = 0; i < 40; i++) R(c, ['#FDE047', '#F9A8D4', '#FFFFFF'][i % 3], r() * w, h - 24 + r() * 14, 2, 2);
        for (let x = 120; x < w; x += 240) lampPost(c, x, h, 62);
        for (let x = 0; x < w; x += 240) {                  // flower urns
            R(c, '#C9A574', x - 8, h - 12, 18, 12);
            R(c, '#EBD3A8', x - 11, h - 30, 24, 4);
            R(c, '#D8B888', x - 9, h - 26, 20, 14);
            R(c, '#B8935F', x - 9, h - 18, 20, 2);
            blob(c, '#2F6B28', x + 1, h - 38, 11);
            for (let i = 0; i < 6; i++) R(c, '#EF4444', x - 8 + r() * 18, h - 46 + r() * 12, 3, 3);
        }
    }

    // ---------------------------------------------------------------
    // Zone 1 — Flower Gardens: terraced beds, topiary, trellis arches
    // ---------------------------------------------------------------
    function midFlowers(c, w, h) {
        const r = rng(202);
        const blooms = ['#F9A8D4', '#FDE047', '#FB923C', '#FFFFFF'];
        for (let x = 30; x < w; x += 92) {
            roundTree(c, x + r() * 30, h - 76, 130 + r() * 56, '#56A843', '#357A2B', blooms[Math.floor(r() * 4)], r);
        }

        R(c, '#2F7A2E', 0, h - 112, w, 112);                 // clipped hedge
        for (let x = 0; x < w; x += 24) {
            R(c, '#2F7A2E', x + 2, h - 120, 20, 8);
            R(c, '#2F7A2E', x + 6, h - 124, 12, 4);
            R(c, '#3E9440', x + 4, h - 118, 8, 3);
        }
        for (let i = 0; i < 120; i++) R(c, r() < 0.5 ? '#3E9440' : '#236325', r() * w, h - 110 + r() * 24, 3, 2);

        for (let x = 60; x < w; x += 180) {                  // topiary: ball-on-ball and cones
            R(c, '#6B4226', x - 2, h - 106, 4, 22);
            blob(c, '#2B6E2A', x, h - 116, 15);
            blob(c, '#3F9142', x - 3, h - 119, 9);
            blob(c, '#2B6E2A', x, h - 140, 10);
            blob(c, '#3F9142', x - 2, h - 142, 6);
            cypress(c, x + 90, h - 84, 70, '#3F9142', '#2B6E2A');
        }

        const cols = ['#F59E0B', '#EF4444', '#FDE047', '#EC4899', '#A855F7', '#FFFFFF', '#FB7185'];
        for (let t = 0; t < 3; t++) {                        // three flower terraces
            const ty = h - 84 + t * 28;
            R(c, ['#3F9142', '#46A04A', '#4FB054'][t], 0, ty, w, 28);
            R(c, '#D9C7A3', 0, ty + 23, w, 4);
            R(c, '#F1E4C6', 0, ty + 23, w, 1);
            R(c, '#B7A27A', 0, ty + 27, w, 1);
            const seg = 60 + t * 20;
            for (let x = 0; x < w; x += seg) {
                const col = cols[Math.floor(r() * cols.length)];
                for (let fx = x + 3; fx < x + seg - 5; fx += 6) {
                    const off = (Math.floor(fx / 6) % 2) * 3;
                    R(c, col, fx, ty + 3 + off, 4, 4);
                    R(c, col, fx + 3, ty + 12 + off, 4, 4);
                    R(c, '#FFF7D6', fx + 1, ty + 4 + off, 2, 2);
                    R(c, '#236325', fx + 1, ty + 9 + off, 2, 2);
                }
                R(c, '#D9C7A3', x + seg - 2, ty, 2, 23);    // stone divider
            }
        }

        for (let x = 250; x < w; x += 480) {                 // rose trellis arches
            R(c, '#F5F0E6', x - 30, h - 150, 4, 66);
            R(c, '#F5F0E6', x + 26, h - 150, 4, 66);
            for (let a = 0; a <= 12; a++) {
                const ang = Math.PI * a / 12;
                const px = x - Math.cos(ang) * 28, py = h - 150 - Math.sin(ang) * 26;
                R(c, '#F5F0E6', px - 2, py - 2, 5, 5);
                R(c, a % 2 ? '#F43F5E' : '#2F7A2E', px - 3, py - 4, 5, 4);
            }
            for (let y = h - 146; y < h - 86; y += 8) {
                R(c, '#F43F5E', x - 32, y, 4, 4);
                R(c, '#2F7A2E', x + 27, y + 4, 4, 4);
                R(c, '#FDA4AF', x + 25, y, 4, 4);
            }
        }
    }

    function nearFlowers(c, w, h) {
        const r = rng(212);
        const cols = ['#F59E0B', '#EF4444', '#FDE047', '#EC4899', '#A855F7', '#FFFFFF'];
        R(c, '#3B8F3E', 0, h - 18, w, 18);
        R(c, '#2C7030', 0, h - 5, w, 5);
        for (let x = 0; x < w; x += 5) {
            const col = cols[Math.floor(x / 40) % cols.length];
            const hh = 4 + Math.floor(r() * 8);
            R(c, '#2C7030', x + 1, h - 18 - hh, 2, hh);
            R(c, col, x, h - 21 - hh, 4, 4);
            R(c, '#FFF7D6', x + 1, h - 20 - hh, 2, 2);
        }
        for (let x = 70; x < w; x += 160) {                  // rose bushes
            blob(c, '#256628', x, h - 26, 18);
            blob(c, '#38913C', x - 4, h - 30, 11);
            for (let i = 0; i < 9; i++) R(c, i % 3 ? '#E11D48' : '#FDA4AF', x - 14 + r() * 28, h - 40 + r() * 22, 4, 4);
        }
        for (let x = 150; x < w; x += 320) {                 // butterflies
            R(c, '#FDE047', x, h - 62, 4, 4);
            R(c, '#FDE047', x + 6, h - 62, 4, 4);
            R(c, '#1F2937', x + 4, h - 61, 2, 4);
            R(c, '#F9A8D4', x + 90, h - 50, 4, 4);
            R(c, '#F9A8D4', x + 96, h - 50, 4, 4);
            R(c, '#1F2937', x + 94, h - 49, 2, 4);
        }
    }

    // ---------------------------------------------------------------
    // Zone 2 — Water Features: arcade, stepped pool, lotus fountains
    // ---------------------------------------------------------------
    const FOUNTAIN_SPACING = 160, FOUNTAIN_FIRST = 80, FOUNTAIN_TOP = 78;

    function midWater(c, w, h) {
        const r = rng(303);
        for (let x = 40; x < w; x += 120) {
            roundTree(c, x + r() * 40, h - 140, 90 + r() * 40, '#5BAA78', '#3C8560', null, r);
        }
        R(c, '#E7DCC8', 0, h - 152, w, 64);                  // long arcade
        R(c, '#F7F0E2', 0, h - 152, w, 4);
        R(c, '#CDBFA6', 0, h - 148, w, 2);
        for (let x = 0; x < w; x += 8) R(c, '#CDBFA6', x + 2, h - 144, 4, 3);
        for (let x = 0; x < w; x += 30) {
            R(c, '#A99A7E', x + 8, h - 130, 14, 42);
            R(c, '#A99A7E', x + 10, h - 134, 10, 4);
            R(c, '#A99A7E', x + 13, h - 137, 4, 3);
            R(c, '#7FA8C4', x + 10, h - 126, 10, 18);
            R(c, '#F7F0E2', x + 2, h - 132, 3, 44);
        }
        for (let x = 120; x < w; x += 240) chhatri(c, x, h - 152, '#D5C7AE', '#F1E8D6', 1.5);

        R(c, '#D5C7AE', 0, h - 92, w, 10);                   // terrace edge
        R(c, '#EFE6D3', 0, h - 92, w, 3);
        for (let i = 0; i < 3; i++) {                        // ghats down to the water
            R(c, ['#CDBFA6', '#C2B398', '#B7A78B'][i], 0, h - 82 + i * 6, w, 6);
            R(c, '#E5DAC4', 0, h - 82 + i * 6, w, 1);
        }
        R(c, '#3E9BD0', 0, h - 64, w, 46);                   // water
        R(c, '#58B2E0', 0, h - 64, w, 8);
        R(c, '#2F86BC', 0, h - 30, w, 12);
        for (let i = 0; i < 80; i++) R(c, '#8FD3F4', r() * w, h - 60 + r() * 40, 6 + r() * 10, 2);
        for (let i = 0; i < 30; i++) R(c, '#D6F1FF', r() * w, h - 58 + r() * 34, 4, 1);
        for (let i = 0; i < 16; i++) {                       // lotus pads
            const x = r() * w, y = h - 54 + r() * 28;
            R(c, '#2E8B57', x, y, 11, 3);
            R(c, '#3DAA6D', x + 1, y, 5, 1);
            R(c, '#F9A8D4', x + 3, y - 3, 5, 3);
            R(c, '#FDF2F8', x + 4, y - 5, 3, 2);
        }
        for (let x = FOUNTAIN_FIRST; x < w; x += FOUNTAIN_SPACING) {   // tiered lotus basins
            R(c, '#D9CDB6', x - 24, h - 52, 48, 8);
            R(c, '#F1E8D6', x - 24, h - 52, 48, 2);
            R(c, '#C2B398', x - 18, h - 44, 36, 4);
            R(c, '#D9CDB6', x - 11, h - 62, 22, 10);
            R(c, '#F1E8D6', x - 14, h - 66, 28, 4);
            R(c, '#F4B6C8', x - 15, h - 71, 7, 5);
            R(c, '#F4B6C8', x + 8, h - 71, 7, 5);
            R(c, '#F9D3DE', x - 6, h - 73, 12, 7);
            R(c, '#C2B398', x - 2, h - FOUNTAIN_TOP, 4, 6);
            R(c, '#A8DBF5', x - 20, h - 50, 40, 2);
        }
        R(c, '#D5C7AE', 0, h - 18, w, 18);                   // front rim
        R(c, '#EFE6D3', 0, h - 18, w, 3);
        R(c, '#A99A7E', 0, h - 4, w, 4);
        for (let x = 0; x < w; x += 40) {
            R(c, '#B7A78B', x, h - 15, 1, 11);
            R(c, '#C2B398', x + 14, h - 11, 12, 4);
        }
    }

    /** Animated jets on top of the water strip. */
    function liveWater(ctx, tileX, tileY) {
        for (let x = FOUNTAIN_FIRST; x < STRIP_W; x += FOUNTAIN_SPACING) {
            const sx = tileX + x;
            if (sx < -50 || sx > CONFIG.WIDTH + 50) continue;
            const base = tileY + MID_H - FOUNTAIN_TOP;
            const jh = 44 + Math.round(Math.sin(animTick * 0.12 + x) * 8);
            ctx.fillStyle = '#E4F6FF';
            ctx.fillRect(sx - 1, base - jh, 3, jh);
            for (let k = 1; k <= 5; k++) {                   // falling arcs
                const dy = jh - k * k * 1.7;
                ctx.fillRect(sx - 2 - k * 4, base - dy, 3, 5);
                ctx.fillRect(sx + k * 4, base - dy, 3, 5);
            }
            ctx.fillStyle = '#FFFFFF';
            for (let d = 0; d < 4; d++) {                    // spray droplets
                const yy = (animTick * 3 + d * 17 + x) % jh;
                ctx.fillRect(sx - 10 + d * 6, base - jh + yy, 2, 2);
            }
            ctx.fillRect(sx - 3, base - jh - 3, 7, 3);
        }
    }

    function nearWater(c, w, h) {
        R(c, '#EFE6D3', 0, h - 36, w, 5);                    // marble balustrade
        R(c, '#CDBFA6', 0, h - 31, w, 2);
        R(c, '#D5C7AE', 0, h - 7, w, 7);
        R(c, '#B7A78B', 0, h - 2, w, 2);
        for (let x = 0; x < w; x += 12) {
            R(c, '#DDD0B8', x + 3, h - 29, 5, 22);
            R(c, '#F4ECDD', x + 3, h - 29, 1, 22);
            R(c, '#DDD0B8', x + 2, h - 21, 7, 6);
        }
        for (let x = 0; x < w; x += 120) {
            R(c, '#E7DCC8', x - 6, h - 46, 13, 46);
            R(c, '#F7F0E2', x - 6, h - 46, 3, 46);
            R(c, '#EFE6D3', x - 9, h - 50, 19, 5);
            R(c, '#F4B6C8', x - 7, h - 57, 5, 7);
            R(c, '#F4B6C8', x + 3, h - 57, 5, 7);
            R(c, '#F9D3DE', x - 3, h - 60, 7, 10);
        }
    }

    // ---------------------------------------------------------------
    // Zone 3 — Pillar Pathway: carved colonnade with corbelled arches
    // ---------------------------------------------------------------
    function midPillars(c, w, h) {
        R(c, '#E6CFAE', 0, h - 240, w, 240);                 // back wall
        for (let y = h - 190; y < h; y += 18) R(c, '#D9BF99', 0, y, w, 1);
        for (let x = 0; x < w; x += 120) {                   // jharokha balcony windows
            R(c, '#8A6A44', x - 18, h - 150, 36, 48);
            R(c, '#8A6A44', x - 14, h - 156, 28, 6);
            R(c, '#8A6A44', x - 8, h - 161, 16, 5);
            R(c, '#A9CDE2', x - 14, h - 146, 28, 42);
            for (let jy = h - 146; jy < h - 104; jy += 7) R(c, '#8A6A44', x - 14, jy, 28, 2);
            for (let jx = x - 14; jx < x + 14; jx += 7) R(c, '#8A6A44', jx, h - 146, 2, 42);
            R(c, '#F2E2C4', x - 22, h - 166, 44, 4);
            R(c, '#C9AD84', x - 22, h - 104, 44, 24);
            R(c, '#F2E2C4', x - 26, h - 106, 52, 4);
            for (let bx = x - 19; bx < x + 19; bx += 6) R(c, '#8A6A44', bx, h - 99, 3, 15);
            R(c, '#B8905C', x - 26, h - 80, 52, 3);
            R(c, '#C9AD84', x - 18, h - 77, 8, 8);
            R(c, '#C9AD84', x + 10, h - 77, 8, 8);
            R(c, '#D9BF99', x - 10, h - 60, 20, 20);          // carved floral panel
            R(c, '#B8905C', x - 2, h - 58, 4, 16);
            R(c, '#B8905C', x - 8, h - 52, 16, 4);
        }

        R(c, '#F2E2C4', 0, h - 278, w, 8);                   // entablature
        for (let x = 0; x < w; x += 10) R(c, '#C9AD84', x + 2, h - 270, 6, 5);
        R(c, '#D9BF99', 0, h - 265, w, 26);
        for (let x = 0; x < w; x += 20) {
            R(c, '#B8905C', x + 8, h - 259, 4, 14);
            R(c, '#B8905C', x + 3, h - 254, 14, 4);
            R(c, '#F2E2C4', x + 9, h - 254, 2, 4);
        }
        R(c, '#F2E2C4', 0, h - 239, w, 5);
        R(c, '#B8905C', 0, h - 234, w, 3);

        for (let px = 60; px < w; px += 120) {
            for (let k = 0; k < 5; k++) {                    // corbelled arch brackets
                R(c, '#D2B48A', px + 24 + k * 7, h - 231, 7, (5 - k) * 6);
                R(c, '#B8905C', px + 24 + k * 7, h - 231 + (5 - k) * 6 - 2, 7, 2);
                R(c, '#D2B48A', px - 31 - k * 7, h - 231, 7, (5 - k) * 6);
                R(c, '#B8905C', px - 31 - k * 7, h - 231 + (5 - k) * 6 - 2, 7, 2);
            }
            R(c, '#8A6A44', px + 59, h - 231, 2, 22);        // hanging brass lamp
            R(c, '#D9A520', px + 54, h - 209, 12, 10);
            R(c, '#FFE38A', px + 57, h - 206, 6, 5);
            R(c, '#D9A520', px + 57, h - 199, 6, 3);

            R(c, '#CDAE83', px - 20, h - 10, 40, 10);        // pillar base
            R(c, '#E9D3AF', px - 17, h - 18, 34, 8);
            R(c, '#CDAE83', px - 15, h - 24, 30, 6);
            R(c, '#DEC299', px - 12, h - 198, 24, 174);      // shaft
            R(c, '#F2E2C4', px - 12, h - 198, 4, 174);
            R(c, '#BF9E72', px + 7, h - 198, 5, 174);
            R(c, '#CDAE83', px - 4, h - 190, 2, 160);
            R(c, '#CDAE83', px + 2, h - 190, 2, 160);
            for (let y = h - 58; y > h - 190; y -= 34) {     // carved bands
                R(c, '#B8905C', px - 14, y, 28, 3);
                R(c, '#F2E2C4', px - 14, y + 3, 28, 2);
                R(c, '#B8905C', px - 14, y + 5, 28, 1);
                R(c, '#C9A876', px - 4, y - 14, 8, 8);
                R(c, '#F2E2C4', px - 2, y - 12, 4, 4);
            }
            R(c, '#E9D3AF', px - 16, h - 206, 32, 8);        // capital
            R(c, '#CDAE83', px - 20, h - 214, 40, 8);
            R(c, '#E9D3AF', px - 24, h - 222, 48, 8);
            R(c, '#B8905C', px - 24, h - 224, 48, 2);
            R(c, '#F2E2C4', px - 28, h - 231, 56, 7);
        }
    }

    function nearPillars(c, w, h) {
        R(c, '#F2E2C4', 0, h - 16, w, 16);                   // low marble plinth
        R(c, '#FFF6E5', 0, h - 16, w, 3);
        R(c, '#CDAE83', 0, h - 4, w, 4);
        for (let x = 0; x < w; x += 24) {
            R(c, '#D9BF99', x + 8, h - 11, 8, 6);
            R(c, '#B8905C', x + 11, h - 9, 2, 2);
        }
        for (let x = 0; x < w; x += 240) diyaStand(c, x, h - 16, 62);
        for (let x = 120; x < w; x += 240) {                 // marigold garland swags
            for (let i = 0; i < 20; i++) {
                const gx = x - 60 + i * 6;
                const gy = h - 44 + Math.sin(Math.PI * i / 19) * 16;
                R(c, i % 2 ? '#F59E0B' : '#EA580C', gx, gy, 5, 5);
            }
        }
    }

    // ---------------------------------------------------------------
    // Zone 4 — Mandir approach: spires, elephant frieze, flags, diyas
    // ---------------------------------------------------------------
    function midTemple(c, w, h) {
        const r = rng(505);
        for (let x = 110; x < w; x += 240) {
            const hh = 140 + r() * 50;
            const tip = shikhara(c, '#EBC093', '#D6A374', x, h - 90, 78, hh);
            R(c, '#FFD24A', x - 2, tip, 4, 8);
            shikhara(c, '#E5B586', '#D6A374', x - 50, h - 90, 38, hh * 0.56);
            shikhara(c, '#E5B586', '#D6A374', x + 50, h - 90, 38, hh * 0.56);
            R(c, '#E5B586', x + 96, h - 124, 48, 34);
            dome(c, '#F1CBA0', x + 120, h - 124, 26, '#FADFBF');
            R(c, '#FFD24A', x + 119, h - 160, 3, 10);
        }

        R(c, '#E8BE93', 0, h - 96, w, 96);                   // carved parapet
        R(c, '#F9DFBF', 0, h - 96, w, 4);
        R(c, '#C99468', 0, h - 92, w, 2);
        for (let x = 0; x < w; x += 10) {
            R(c, '#D4A379', x + 3, h - 88, 4, 16);
            R(c, '#F1CBA0', x + 3, h - 88, 1, 16);
        }
        R(c, '#F9DFBF', 0, h - 72, w, 4);
        R(c, '#DDAE82', 0, h - 68, w, 32);
        for (let x = 0; x < w; x += 48) elephant(c, x + 8, h - 62, '#B9855A', '#A06F45');
        R(c, '#F9DFBF', 0, h - 36, w, 3);
        for (let x = 0; x < w; x += 16) {                    // lotus petal band
            R(c, '#C99468', x + 4, h - 29, 8, 6);
            R(c, '#C99468', x + 6, h - 32, 4, 3);
            R(c, '#F1CBA0', x + 7, h - 28, 2, 3);
        }
        R(c, '#C99468', 0, h - 16, w, 16);
        R(c, '#B9855A', 0, h - 4, w, 4);
        for (let x = 0; x < w; x += 32) R(c, '#B9855A', x, h - 16, 1, 12);

        for (let x = 0; x < w; x += 30) {                    // row of diyas
            R(c, '#9A4B12', x + 10, h - 101, 10, 5);
            R(c, '#FFB300', x + 13, h - 108, 4, 7);
            R(c, '#FFF3B0', x + 14, h - 106, 2, 3);
        }
        for (let x = 120; x < w; x += 240) {                 // flag poles + toran
            flagPole(c, x, h - 96, 120);
            for (let i = 0; i < 40; i++) {
                const gx = x + i * 6;
                const gy = h - 196 + Math.sin(Math.PI * i / 39) * 34;
                R(c, i % 3 === 0 ? '#15803D' : (i % 3 === 1 ? '#F59E0B' : '#EA580C'), gx, gy, 5, 5);
            }
        }
    }

    function nearTemple(c, w, h) {
        const r = rng(515);
        R(c, '#F3DCC0', 0, h - 12, w, 12);
        R(c, '#FFF1DC', 0, h - 12, w, 3);
        R(c, '#D4A379', 0, h - 3, w, 3);
        for (let x = 0; x < w; x += 20) {                    // diyas along the path
            R(c, '#9A4B12', x + 5, h - 17, 10, 5);
            R(c, '#FFB300', x + 8, h - 24, 4, 7);
            R(c, '#FFF3B0', x + 9, h - 22, 2, 3);
        }
        for (let x = 60; x < w; x += 240) {                  // kalash pots with coconuts
            R(c, '#B77A26', x - 8, h - 30, 18, 18);
            R(c, '#D9A520', x - 10, h - 26, 22, 10);
            R(c, '#F4D06F', x - 8, h - 25, 4, 6);
            R(c, '#B77A26', x - 5, h - 34, 12, 4);
            R(c, '#15803D', x - 9, h - 42, 6, 9);
            R(c, '#15803D', x + 5, h - 42, 6, 9);
            R(c, '#8B5A2B', x - 3, h - 46, 8, 10);
        }
        for (let x = 180; x < w; x += 240) diyaStand(c, x, h - 12, 56);
        for (let i = 0; i < 60; i++) R(c, ['#F59E0B', '#EF4444', '#FDE047'][i % 3], r() * w, h - 10 + r() * 6, 2, 2);
    }

    // ---------------------------------------------------------------
    // Ground: paved path (top 62px) + front verge, one tile per zone
    // ---------------------------------------------------------------
    const GROUNDS = [
        { path: '#C9A66B', joint: '#A9854E', hi: '#E3C48C', lo: '#B8935A', tileW: 32, curb: '#8E7446', verge: '#4A8A3A' },
        { path: '#D8B97E', joint: '#B5955C', hi: '#EDD3A0', lo: '#C6A66C', tileW: 32, curb: '#9A8050', verge: '#3F9142' },
        { path: '#AEB4B8', joint: '#878E93', hi: '#CBD1D4', lo: '#9BA2A6', tileW: 40, curb: '#7C8388', verge: '#C2B398' },
        { path: '#EAD9BD', joint: '#C9B592', hi: '#FAEEDA', lo: '#D9C6A6', tileW: 20, curb: '#B8905C', verge: '#E6CFAE' },
        { path: '#F4E6D2', joint: '#D9B56A', hi: '#FFF6E8', lo: '#E6D3B8', tileW: 40, curb: '#C99468', verge: '#EBC9A2' },
    ];

    function drawGround(zi) {
        return (c, w, h) => {
            const r = rng(900 + zi);
            const G = GROUNDS[zi];
            R(c, G.path, 0, 0, w, 62);
            for (let row = 0; row < 5; row++) {
                const y = 2 + row * 12;
                R(c, G.joint, 0, y, w, 1);
                const shift = (row % 2) * (G.tileW / 2);
                for (let x = -G.tileW; x < w + G.tileW; x += G.tileW) {
                    R(c, G.joint, x + shift, y, 1, 12);
                    if (zi === 3 && ((Math.floor(x / G.tileW) + row) % 2 === 0)) {
                        R(c, '#DDB7A0', x + shift + 1, y + 1, G.tileW - 1, 11);   // rose marble checker
                    }
                    R(c, G.hi, x + shift + 1, y + 1, G.tileW - 2, 1);
                }
            }
            for (let i = 0; i < 70; i++) R(c, r() < 0.5 ? G.hi : G.lo, r() * w, 4 + r() * 56, 2 + r() * 3, 1);
            if (zi === 1) for (let i = 0; i < 24; i++) R(c, '#7BAA5A', r() * w, 4 + r() * 56, 3, 2);   // moss
            if (zi === 4) { R(c, '#E2B84C', 0, 26, w, 2); R(c, '#E2B84C', 0, 38, w, 2); }               // gold inlay
            R(c, G.hi, 0, 0, w, 2);
            R(c, G.curb, 0, 62, w, 6);
            R(c, G.hi, 0, 62, w, 1);

            R(c, G.verge, 0, 68, w, h - 68);
            if (zi === 0 || zi === 1) {
                for (let i = 0; i < 150; i++) {
                    R(c, r() < 0.5 ? '#2F6B28' : '#63B04E', r() * w, 70 + r() * 38, 2, 4 + r() * 3);
                }
                const n = zi === 1 ? 46 : 14;
                const cols = ['#FDE047', '#F9A8D4', '#FFFFFF', '#FB923C', '#C084FC'];
                for (let i = 0; i < n; i++) {
                    const fx = r() * w, fy = 74 + r() * 30;
                    R(c, '#2F6B28', fx + 1, fy + 3, 2, 5);
                    R(c, cols[i % cols.length], fx, fy, 4, 4);
                }
            } else if (zi === 2) {
                R(c, '#EFE6D3', 0, 68, w, 3);
                R(c, '#3E9BD0', 0, 76, w, 22);               // water channel
                R(c, '#58B2E0', 0, 76, w, 4);
                for (let i = 0; i < 34; i++) R(c, '#A8DBF5', r() * w, 80 + r() * 16, 5 + r() * 8, 1);
                R(c, '#A99A7E', 0, 98, w, 3);
                for (let x = 0; x < w; x += 40) R(c, '#A99A7E', x, 101, 1, 9);
            } else if (zi === 3) {
                R(c, '#FAEEDA', 0, 68, w, 3);
                for (let x = 0; x < w; x += 40) {            // inlay diamonds
                    R(c, '#B8905C', x + 16, 78, 8, 20);
                    R(c, '#B8905C', x + 10, 84, 20, 8);
                    R(c, '#F2E2C4', x + 18, 84, 4, 8);
                }
                R(c, '#CDAE83', 0, 104, w, 6);
            } else {
                R(c, '#FFF1DC', 0, 68, w, 3);
                for (let x = 0; x < w; x += 80) {            // rangoli
                    const cx = x + 40, cy = 90;
                    R(c, '#EF4444', cx - 10, cy - 2, 20, 4);
                    R(c, '#EF4444', cx - 2, cy - 10, 4, 20);
                    R(c, '#F59E0B', cx - 6, cy - 6, 12, 12);
                    R(c, '#FDE047', cx - 3, cy - 3, 6, 6);
                    R(c, '#15803D', cx - 14, cy - 1, 3, 2);
                    R(c, '#15803D', cx + 11, cy - 1, 3, 2);
                    R(c, '#FFFFFF', cx - 1, cy - 1, 2, 2);
                    R(c, '#9A4B12', x + 2, 94, 10, 5);        // diya
                    R(c, '#FFB300', x + 5, 87, 4, 7);
                }
            }
        };
    }

    // ---------------------------------------------------------------
    // The Mandir (static part, painted once)
    // ---------------------------------------------------------------
    function drawTempleStatic(c, w, h) {
        const S = '#E8C898', L = '#F6E2BE', D = '#C9A070', B = '#B58A5C', GOLD = '#FFD24A';
        const cx = w / 2;

        // plinth: three steps with lotus band
        R(c, '#EAD2B0', 0, h - 14, w, 14);
        R(c, L, 0, h - 14, w, 2);
        R(c, '#EAD2B0', 10, h - 26, w - 20, 12);
        R(c, L, 10, h - 26, w - 20, 2);
        R(c, '#EAD2B0', 20, h - 36, w - 40, 10);
        R(c, GOLD, 20, h - 36, w - 40, 2);
        for (let x = 4; x < w - 8; x += 14) { R(c, D, x + 3, h - 9, 7, 5); R(c, D, x + 5, h - 11, 3, 2); }
        for (let x = 14; x < w - 44; x += 44) elephant(c, x + 4, h - 25, D, B);

        // central spire with clustered sub-spires
        let tip = shikhara(c, S, D, cx, h - 132, 124, 116);
        R(c, GOLD, cx - 3, tip - 2, 6, 10);
        R(c, GOLD, cx - 6, tip + 6, 12, 3);
        shikhara(c, L, D, cx - 40, h - 132, 44, 70);
        shikhara(c, L, D, cx + 40, h - 132, 44, 70);
        shikhara(c, L, D, cx, h - 132, 40, 52);
        [-1, 1].forEach(s => {
            tip = shikhara(c, S, D, cx + s * 96, h - 132, 58, 84);
            R(c, GOLD, cx + s * 96 - 2, tip - 1, 4, 8);
            shikhara(c, L, D, cx + s * 96, h - 132, 26, 40);
            R(c, D, cx + s * 152 - 26, h - 146, 52, 14);     // dome drum
            R(c, L, cx + s * 152 - 28, h - 148, 56, 3);
            dome(c, S, cx + s * 152, h - 148, 26, L);
            R(c, GOLD, cx + s * 152 - 2, h - 186, 4, 12);
            chhatri(c, cx + s * 186, h - 132, D, L, 0.8);
        });

        // mandapa hall
        R(c, S, 26, h - 132, w - 52, 96);
        R(c, L, 20, h - 138, w - 40, 8);
        R(c, GOLD, 20, h - 131, w - 40, 2);
        for (let x = 22; x < w - 24; x += 8) R(c, D, x + 2, h - 128, 4, 4);   // dentils
        R(c, D, 26, h - 122, w - 52, 2);
        for (let x = 30; x < w - 40; x += 20) {                               // frieze
            R(c, B, x + 8, h - 118, 4, 8);
            R(c, B, x + 5, h - 116, 10, 4);
        }
        R(c, L, 26, h - 108, w - 52, 3);

        // arcade of pillars and arched niches
        const cols = [44, 90, 136, 264, 310, 356];
        cols.forEach(px => {
            R(c, D, px - 9, h - 44, 18, 8);
            R(c, '#DEC299', px - 6, h - 98, 12, 54);
            R(c, L, px - 6, h - 98, 3, 54);
            R(c, B, px + 3, h - 98, 3, 54);
            R(c, B, px - 7, h - 74, 14, 2);
            R(c, B, px - 7, h - 60, 14, 2);
            R(c, L, px - 9, h - 104, 18, 6);
        });
        [67, 113, 287, 333].forEach(nx => {
            R(c, B, nx - 12, h - 88, 24, 52);
            R(c, B, nx - 8, h - 93, 16, 5);
            R(c, B, nx - 4, h - 97, 8, 4);
            R(c, '#8A6238', nx - 9, h - 84, 18, 44);
            for (let jy = h - 82; jy < h - 42; jy += 6) {
                for (let jx = nx - 8; jx < nx + 8; jx += 6) R(c, D, jx, jy, 3, 3);
            }
        });

        // grand doorway
        R(c, L, cx - 44, h - 112, 88, 76);
        R(c, D, cx - 40, h - 108, 80, 72);
        R(c, GOLD, cx - 34, h - 102, 68, 66);
        R(c, '#3A2114', cx - 30, h - 92, 60, 56);
        R(c, '#3A2114', cx - 24, h - 98, 48, 6);
        R(c, '#3A2114', cx - 14, h - 102, 28, 4);
        [-1, 1].forEach(s => {
            R(c, '#DEC299', cx + s * 50 - 7, h - 104, 14, 60);
            R(c, L, cx + s * 50 - 7, h - 104, 3, 60);
            R(c, L, cx + s * 50 - 10, h - 110, 20, 6);
            R(c, D, cx + s * 50 - 10, h - 44, 20, 8);
        });
        for (let i = 0; i < 14; i++) {                        // toran over the door
            R(c, i % 2 ? '#F59E0B' : '#15803D', cx - 42 + i * 6, h - 112 + (i % 4 < 2 ? 0 : 3), 5, 5);
        }
    }

    /** Animated parts of the temple: door glow, flags, diya flames. */
    function drawTempleLive(ctx, x, baseY) {
        const cx = x + TEMPLE_W / 2;
        const pulse = 0.5 + 0.5 * Math.sin(animTick * 0.1);

        ctx.fillStyle = `rgba(255, 200, 80, ${0.35 + 0.3 * pulse})`;
        ctx.fillRect(cx - 26, baseY - 90, 52, 54);
        ctx.fillStyle = `rgba(255, 240, 180, ${0.55 + 0.35 * pulse})`;
        ctx.fillRect(cx - 12, baseY - 80, 24, 44);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + 0.4 * pulse})`;
        ctx.fillRect(cx - 5, baseY - 70, 10, 30);

        const wave = Math.round(Math.sin(animTick * 0.2) * 3);
        const flags = [[cx, 262, 30], [cx - 96, 226, 20], [cx + 96, 226, 20]];
        flags.forEach(([fx, top, len]) => {
            ctx.fillStyle = '#7A5230';
            ctx.fillRect(fx - 1, baseY - top - len, 2, len);
            ctx.fillStyle = '#FF7A1A';
            ctx.fillRect(fx + 1, baseY - top - len + wave, 22, 6);
            ctx.fillRect(fx + 1, baseY - top - len + 6 + wave, 15, 5);
            ctx.fillRect(fx + 1, baseY - top - len + 11 + wave, 8, 4);
        });

        for (let i = 0; i < 9; i++) {
            const dx = x + 30 + i * 42;
            const fl = (Math.floor(animTick / 4) + i) % 2;
            ctx.fillStyle = '#9A4B12';
            ctx.fillRect(dx, baseY - 19, 10, 5);
            ctx.fillStyle = '#FFB300';
            ctx.fillRect(dx + 3, baseY - 26 - fl, 4, 7 + fl);
            ctx.fillStyle = '#FFF3B0';
            ctx.fillRect(dx + 4, baseY - 24, 2, 3);
        }
    }

    // ---------------------------------------------------------------
    // Build everything once
    // ---------------------------------------------------------------
    function build() {
        strips.clouds  = makeStrip(1920, 170, drawClouds);
        strips.hills   = makeStrip(STRIP_W, 220, drawHills);
        strips.skyline = makeStrip(1440, 260, drawSkyline);
        strips.mid  = [midGarden, midFlowers, midWater, midPillars, midTemple].map(f => makeStrip(STRIP_W, MID_H, f));
        strips.near = [nearGarden, nearFlowers, nearWater, nearPillars, nearTemple].map(f => makeStrip(STRIP_W, NEAR_H, f));
        strips.ground = GROUNDS.map((g, zi) => makeStrip(GROUND_TILE_W, GROUND_H, drawGround(zi)));

        const t = document.createElement('canvas');
        t.width = TEMPLE_W;
        t.height = TEMPLE_H;
        const tc = t.getContext('2d');
        tc.imageSmoothingEnabled = false;
        drawTempleStatic(tc, TEMPLE_W, TEMPLE_H);
        strips.temple = t;
        built = true;
    }

    // ---------------------------------------------------------------
    // Per-frame rendering
    // ---------------------------------------------------------------

    /** Tiles a strip across the screen. live(tileX, y) draws animated extras. */
    function tile(ctx, cv, offset, y, alpha, live) {
        if (alpha <= 0) return;
        const w = cv.width;
        let x = -(((offset % w) + w) % w);
        ctx.globalAlpha = alpha;
        for (; x < CONFIG.WIDTH; x += w) {
            const tx = Math.round(x);
            ctx.drawImage(cv, tx, y);
            if (live) live(ctx, tx, y);
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Which two zones are on screen and how far the blend between them is.
     * The blend runs over 400px of travel centred on the zone boundary.
     */
    function zoneBlend(worldX) {
        const a = CONFIG.getZoneIndex(Math.max(0, worldX - 200));
        const b = CONFIG.getZoneIndex(worldX + 200);
        if (a === b) return { a, b, t: 0 };
        const boundary = CONFIG.ZONES[b].start;
        return { a, b, t: Math.max(0, Math.min(1, (worldX + 200 - boundary) / 400)) };
    }

    function renderSky(ctx, zb) {
        const A = CONFIG.ZONES[zb.a], B = CONFIG.ZONES[zb.b];
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.GROUND_Y);
        grad.addColorStop(0, mix(A.skyTop, B.skyTop, zb.t));
        grad.addColorStop(1, mix(A.skyBottom, B.skyBottom, zb.t));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.GROUND_Y);

        // Sun: high and pale by day, low and orange at the mandir
        const dusk = zb.b === 4 ? (zb.a === 4 ? 1 : zb.t) : 0;
        const sx = 800, sy = Math.round(84 + dusk * 110), rad = 26 + dusk * 12;
        blob(ctx, mix('#FFF6C8', '#FFC46B', dusk), sx, sy, rad + 12);
        blob(ctx, mix('#FFE98A', '#FF9A3D', dusk), sx, sy, rad);
        blob(ctx, mix('#FFF9DC', '#FFD27A', dusk), sx - 4, sy - 4, rad * 0.55);
    }

    function renderGround(ctx, cameraX) {
        const GY = CONFIG.GROUND_Y;
        const stairsSx = CONFIG.STAIRS_X - cameraX;
        CONFIG.ZONES.forEach((z, zi) => {
            const last = zi === CONFIG.ZONES.length - 1;
            let x0 = Math.round((zi === 0 ? -1e6 : z.start) - cameraX);
            let x1 = Math.round((last ? 1e6 : z.end) - cameraX);
            x0 = Math.max(0, x0);
            x1 = Math.min(CONFIG.WIDTH, x1);
            if (x1 <= x0) return;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, GY, x1 - x0, CONFIG.HEIGHT - GY);
            ctx.clip();
            let tx = -(((cameraX % GROUND_TILE_W) + GROUND_TILE_W) % GROUND_TILE_W);
            for (; tx < CONFIG.WIDTH; tx += GROUND_TILE_W) ctx.drawImage(strips.ground[zi], Math.round(tx), GY);
            ctx.restore();
            if (zi > 0 && x0 > 0) {                          // stone threshold between zones
                R(ctx, '#8B7355', x0 - 3, GY, 6, 62);
                R(ctx, '#C9B48E', x0 - 3, GY, 2, 62);
            }
        });
        return stairsSx;
    }

    /** Marble staircase rising to the temple platform. */
    function renderStairs(ctx, cameraX) {
        const sx = Math.round(CONFIG.STAIRS_X - cameraX);
        if (sx > CONFIG.WIDTH) return;
        const GY = CONFIG.GROUND_Y, SW = CONFIG.STAIR_STEP_W, SH = CONFIG.STAIR_STEP_H, N = CONFIG.STAIR_STEPS;
        const right = CONFIG.WIDTH + 4;

        // plinth below ground line, covering the ordinary ground
        R(ctx, '#E1CDAA', sx, GY, right - sx, CONFIG.HEIGHT - GY);
        for (let y = GY + 18; y < CONFIG.HEIGHT; y += 18) R(ctx, '#C9B48E', sx, y, right - sx, 1);
        for (let wx = 0; wx < right - sx; wx += 44) {
            for (let row = 0; row < 7; row++) R(ctx, '#C9B48E', sx + wx + (row % 2) * 22, GY + row * 18, 1, 18);
        }
        R(ctx, '#B89C6E', sx, GY, 5, CONFIG.HEIGHT - GY);
        R(ctx, '#B89C6E', sx, CONFIG.HEIGHT - 10, right - sx, 10);

        for (let i = 0; i < N; i++) {
            const x = sx + i * SW;
            const y = GY - (i + 1) * SH;
            if (x > CONFIG.WIDTH) break;
            R(ctx, '#F3E9D7', x, y, right - x, SH);
            R(ctx, '#E1D2B6', x, y + SH - 4, right - x, 4);          // course line
            for (let bx = x + ((i % 2) * 20); bx < right; bx += 40) R(ctx, '#E1D2B6', bx, y + 4, 1, SH - 8);
            R(ctx, '#D7C29C', x, y, 5, SH);                          // riser shadow
            R(ctx, '#B89C6E', x, y, 2, SH);
            R(ctx, '#FFD24A', x - 3, y, right - x + 3, 4);            // gold nosing
            R(ctx, '#FFF0B0', x - 3, y, right - x + 3, 1);
            R(ctx, '#C9962A', x - 3, y + 4, right - x + 3, 1);
            for (let lx = x + 12; lx < Math.min(x + SW, right) - 4; lx += 16) {   // lotus carving
                R(ctx, '#E3C9A0', lx, y + 10, 8, 6);
                R(ctx, '#E3C9A0', lx + 2, y + 8, 4, 2);
            }
        }
        // inlay on the top platform
        const px = sx + (N - 1) * SW + SW, py = GY - N * SH;
        if (px < CONFIG.WIDTH) {
            R(ctx, '#E2B84C', px, py + 9, right - px, 2);
            for (let dx = px + 10; dx < right; dx += 30) {
                R(ctx, '#D9BF99', dx, py + 14, 10, 8);
                R(ctx, '#B8905C', dx + 3, py + 16, 4, 4);
            }
        }
    }

    function renderTemple(ctx, cameraX) {
        const x = Math.round(CONFIG.TEMPLE_X - cameraX);
        if (x > CONFIG.WIDTH + 20 || x < -TEMPLE_W - 20) return;
        const baseY = CONFIG.getGroundY(CONFIG.TEMPLE_X + 10);
        ctx.drawImage(strips.temple, x, baseY - TEMPLE_H);
        drawTempleLive(ctx, x, baseY);
    }

    // Traditional Toran Archway at Choice Points
    function renderChoiceMarkers(ctx, cameraX, choices) {
        const GY = CONFIG.GROUND_Y;
        choices.forEach(cp => {
            if (cp.passed) return;
            const sx = Math.round(cp.worldX - cameraX) + 50;   // just ahead of the player
            if (sx < -120 || sx > CONFIG.WIDTH + 120) return;

            const auraPulse = 0.5 + 0.5 * Math.sin(animTick * 0.12);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.12 + 0.1 * auraPulse})`;
            ctx.fillRect(sx - 30, GY - 166, 116, 166);

            [sx - 12, sx + 52].forEach(px => {               // carved posts
                R(ctx, '#B58A4A', px - 3, GY - 8, 22, 8);
                R(ctx, '#C4A060', px, GY - 140, 16, 132);
                R(ctx, '#E3C48C', px, GY - 140, 4, 132);
                R(ctx, '#A48040', px + 12, GY - 140, 4, 132);
                for (let y = GY - 120; y < GY - 20; y += 26) R(ctx, '#A48040', px - 1, y, 18, 3);
                R(ctx, '#E8D0B0', px - 4, GY - 148, 24, 8);
            });
            R(ctx, '#B45309', sx - 20, GY - 160, 96, 12);    // lintel
            R(ctx, '#F59E0B', sx - 20, GY - 160, 96, 3);
            R(ctx, '#7C2D12', sx - 20, GY - 150, 96, 2);
            for (let i = 0; i < 14; i++) {                   // marigold garland & mango leaves
                const lx = sx - 14 + i * 6;
                const dip = Math.round(Math.sin(Math.PI * i / 13) * 10);
                R(ctx, i % 2 === 0 ? '#15803D' : '#F59E0B', lx, GY - 146 + dip, 6, 6);
            }
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 34px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('?', sx + 30, GY - 162);
            ctx.fillStyle = '#FFD700';
            ctx.fillText('?', sx + 28, GY - 164);
        });
    }

    function renderProgressBar(ctx, worldX, demonWorldX) {
        const bx = 90, by = 8, bw = CONFIG.WIDTH - 180, bh = 14;

        ctx.fillStyle = 'rgba(7, 9, 22, 0.75)';
        ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

        CONFIG.ZONES.forEach(z => {
            const sx = bx + (z.start / CONFIG.TOTAL_DISTANCE) * bw;
            const sw = ((z.end - z.start) / CONFIG.TOTAL_DISTANCE) * bw;
            ctx.fillStyle = z.path;
            ctx.fillRect(sx, by, Math.max(0, sw - 1), bh);
        });

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(bx + bw - 10, by - 5, 10, bh + 10);

        if (typeof demonWorldX === 'number') {
            const dpx = bx + Math.max(0, Math.min(1, demonWorldX / CONFIG.TOTAL_DISTANCE)) * bw;
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.moveTo(dpx, by - 4);
            ctx.lineTo(dpx + 10, by + bh / 2);
            ctx.lineTo(dpx, by + bh + 4);
            ctx.closePath();
            ctx.fill();
        }

        const px = bx + Math.min(1, worldX / CONFIG.TOTAL_DISTANCE) * bw;
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(px - 5, by - 5, 10, bh + 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px - 2, by - 2, 4, bh + 4);

        ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const cz = CONFIG.getZone(worldX);
        ctx.fillStyle = '#000';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2 + 1, by + bh + 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2, by + bh + 5);
    }

    // Demon warning pulse: red glow on left edge
    function renderDemonWarning(ctx, warningLevel, frameCount) {
        if (!warningLevel || warningLevel < 1) return;
        const fc = frameCount || 0;
        const alpha = warningLevel === 1 ? 0.08 : 0.08 + 0.12 * Math.abs(Math.sin(fc * 0.3));
        const grad = ctx.createLinearGradient(0, 0, 160, 0);
        grad.addColorStop(0, `rgba(255,0,0,${alpha})`);
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 160, CONFIG.HEIGHT);
    }

    // ---- Public render ----

    function render(ctx, worldX, choices, demonWorldX, warningLevel, frameCount) {
        if (!built) build();
        animTick++;
        const GY = CONFIG.GROUND_Y;
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        const zb = zoneBlend(worldX);
        const alphaA = zb.a === zb.b ? 1 : Math.min(1, 2 - 2 * zb.t);
        const alphaB = zb.a === zb.b ? 0 : Math.min(1, 2 * zb.t);

        renderSky(ctx, zb);
        tile(ctx, strips.clouds, cameraX * 0.06 + animTick * 0.15, 30, 0.9);
        tile(ctx, strips.hills, cameraX * 0.10, GY - 220, 0.85);
        tile(ctx, strips.skyline, cameraX * 0.20, GY - 260, 0.75);

        const midY = GY - MID_H, nearY = GY - NEAR_H;
        tile(ctx, strips.mid[zb.a], cameraX * 0.5, midY, alphaA, zb.a === 2 ? liveWater : null);
        if (alphaB > 0) tile(ctx, strips.mid[zb.b], cameraX * 0.5, midY, alphaB, zb.b === 2 ? liveWater : null);
        tile(ctx, strips.near[zb.a], cameraX * 0.8, nearY, alphaA);
        if (alphaB > 0) tile(ctx, strips.near[zb.b], cameraX * 0.8, nearY, alphaB);

        renderGround(ctx, cameraX);
        renderStairs(ctx, cameraX);
        renderTemple(ctx, cameraX);
        renderChoiceMarkers(ctx, cameraX, choices || []);
        renderProgressBar(ctx, worldX, demonWorldX);
        renderDemonWarning(ctx, warningLevel, frameCount);
    }

    return { render };
})();
