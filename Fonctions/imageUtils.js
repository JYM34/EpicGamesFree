// Fonctions/imageUtils.js
const imageCache = new Map();

const isMysteryGame = (title) => title.toLowerCase().includes("mystery");

const getValidImageByType = (title, keyImages, validType) => {
    const cacheKey = `${encodeURIComponent(title)}_${validType}`;
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

    const localDateTime = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    // 🎭 Gestion spéciale "Mystery Game"
    if (isMysteryGame(title)) {
        // ✅ ICI : Le lien officiel du teaser de Noël 2025 (extrait de ton JSON)
        const mysteryImage = "https://cdn1.epicgames.com/offer/d5241c76f178492ea1540fce45616757/Holiday25_FreeGames_Teaser_2560x1440_2560x1440-012542ce76be0f7521af765ba97d3453"; 
        
        imageCache.set(cacheKey, mysteryImage);
        return mysteryImage;
    }

    if (!keyImages || !Array.isArray(keyImages) || keyImages.length === 0) {
        console.warn(`${localDateTime} : ${title} ==> ⚠️ Aucune image disponible (tableau vide ou invalide).`);
        // Tu peux aussi mettre le lien Epic ici en fallback global si tu veux
        const fallback = "https://cdn1.epicgames.com/offer/d5241c76f178492ea1540fce45616757/Holiday25_FreeGames_Teaser_2560x1440_2560x1440-012542ce76be0f7521af765ba97d3453";
        imageCache.set(cacheKey, fallback);
        return fallback;
    }

    // ... le reste de ton code reste identique ...
    const priorityTypes = [validType, "DieselStoreFrontTall",  "DieselStoreFrontWide", "VaultClosed", "featuredMedia"];
    for (const type of priorityTypes) {
        const found = keyImages.find(img => img?.type === type);
        if (found) {
            imageCache.set(cacheKey, found.url);
            return found.url;
        }
    }

    console.warn(`${localDateTime} : ${title} ==> ⚠️ Aucune image valide trouvée parmi : ${priorityTypes.join(', ')}`);
    // console.table(...) // Optionnel pour le debug

    // Fallback final
    const fallback = "https://cdn1.epicgames.com/offer/d5241c76f178492ea1540fce45616757/Holiday25_FreeGames_Teaser_2560x1440_2560x1440-012542ce76be0f7521af765ba97d3453";
    imageCache.set(cacheKey, fallback);
    return fallback;
};

module.exports = {
    getValidImageByType,
    isMysteryGame
};
