// ============================================================
// ASSETS — Image manifest loader + pre-scaled sprite cache
// ============================================================
const Assets = (() => {
    const images = {};
    const spriteCache = {};

    const MANIFEST = {
        CHAR_SHEET:    'assets/character/character_sheet.png',
        DEMON_SHEET:   'assets/demon/demon_sheet.png',
        OBS_INSTAGRAM: 'assets/obstacles/obs_instagram.png',
        OBS_TIKTOK:    'assets/obstacles/obs_tiktok.png',
        OBS_BOTTLE:    'assets/obstacles/obs_bottle.png',
        OBS_CIGARETTE: 'assets/obstacles/obs_cigarette.png',
    };

    /**
     * Load all images in the manifest.
     * Each image that fails to load is set to null (the game then draws
     * that thing procedurally instead).
     * @returns {Promise<void>} Resolves when all images have settled.
     */
    function init() {
        const promises = Object.entries(MANIFEST).map(([key, src]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    images[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    images[key] = null;
                    resolve();
                };
                img.src = src;
            });
        });
        return Promise.all(promises).then(() => undefined);
    }

    /**
     * Retrieve a loaded image by manifest key.
     * @returns {HTMLImageElement|null}
     */
    function get(key) {
        return images[key] || null;
    }

    /**
     * Returns one region of a source image, scaled once to its on-screen
     * size and cached. The source PNGs are many times larger than they are
     * drawn, so scaling them every frame would be slow and noisy.
     *
     * @param {string} key   manifest key
     * @param {number[]} r   [sx, sy, sw, sh] region inside the source image
     * @param {number} drawH height in canvas pixels (width keeps the aspect)
     * @returns {HTMLCanvasElement|null} null while the image is not loaded
     */
    function sprite(key, r, drawH) {
        const id = key + ':' + r[0] + ':' + r[1] + ':' + drawH;
        if (spriteCache[id]) return spriteCache[id];
        const img = images[key];
        if (!img) return null;

        const dh = Math.max(1, Math.round(drawH));
        const dw = Math.max(1, Math.round(drawH * r[2] / r[3]));
        const cv = document.createElement('canvas');
        cv.width = dw;
        cv.height = dh;
        const c = cv.getContext('2d');
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        c.drawImage(img, r[0], r[1], r[2], r[3], 0, 0, dw, dh);
        spriteCache[id] = cv;
        return cv;
    }

    return { init, get, sprite };
})();
