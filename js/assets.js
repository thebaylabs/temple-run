// ============================================================
// ASSETS — Image manifest loader
// ============================================================
const Assets = (() => {
    const images = {};

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
     * Each image that fails to load is set to null (graceful degradation).
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
                    resolve(); // non-fatal — game draws procedurally
                };
                img.src = src;
            });
        });
        return Promise.all(promises).then(() => undefined);
    }

    /**
     * Retrieve a loaded image by manifest key.
     * @param {string} key — e.g. 'CHAR_SHEET'
     * @returns {HTMLImageElement|null}
     */
    function get(key) {
        return images.hasOwnProperty(key) ? images[key] : null;
    }

    return { init, get };
})();
