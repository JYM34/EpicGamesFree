// Fonctions/imageUtils.js
const imageCache = new Map();

const isMysteryGame = (title) => title.toLowerCase().includes("mystery");

const getValidImageByType = (title, keyImages, validType) => {
    const cacheKey = `${title}_${validType}`;
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

    const localDateTime = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    // 🎭 Gestion spéciale "Mystery Game"
    if (isMysteryGame(title)) {
        const mysteryImage = "https://ftp.nkconcept.fr/jeux-mystere.png"; // Ton placeholder custom
        imageCache.set(cacheKey, mysteryImage);
        return mysteryImage;
    }

    if (!keyImages || !Array.isArray(keyImages) || keyImages.length === 0) {
        console.warn(`${localDateTime} : ${title} ==> ⚠️ Aucune image disponible (tableau vide ou invalide).`);
        const fallback = "https://ftp.nkconcept.fr/jeux-mystere.png";
        imageCache.set(cacheKey, fallback);
        return fallback;
    }

    const priorityTypes = [validType, "DieselStoreFrontWide", "VaultClosed", "featuredMedia"];
    for (const type of priorityTypes) {
        const found = keyImages.find(img => img?.type === type);
        if (found) {
            imageCache.set(cacheKey, found.url);
            return found.url;
        }
    }

    console.warn(`${localDateTime} : ${title} ==> ⚠️ Aucune image valide trouvée parmi : ${priorityTypes.join(', ')}`);
    console.table(keyImages.map(img => ({ "Type d'image": img.type, "URL": img.url })));

    const fallback = "https://ftp.nkconcept.fr/jeux-mystere.png";
    imageCache.set(cacheKey, fallback);
    return fallback;
};

module.exports = {
    getValidImageByType,
    isMysteryGame
};
