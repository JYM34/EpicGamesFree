const axios = require("axios");
const { getValidImageByType } = require('Fonctions/imageUtils');

/**
 * 🔍 Récupère les jeux gratuits (actuels et à venir) depuis l’Epic Games Store
 * @returns {Promise<{ currentGames: Array, nextGames: Array }>}
 */
async function getFreeEpicGames() {
  // 📡 URL de l’API publique d’Epic Games (pas de clé requise)
  const url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=fr-FR&country=FR&allowCountries=FR";

  try {
    // 📥 Requête HTTP via axios
    const { data } = await axios.get(url);
    const elements = data?.data?.Catalog?.searchStore?.elements || [];

    // 🎮 Deux tableaux de résultats : en cours et à venir
    const currentGames = [];
    const nextGames = [];

    for (const game of elements) {
      // ⛔ Ignore les jeux sans promo
      if (!game.promotions) continue;

      // ❌ Ignore les jeux sans date de fin (ex : démo, etc.)
      if (game.expiryDate === null) continue;

      // 🔧 Données de base communes
      const base = {
        title: game.title,
        description: game.description,
        offerType: game.offerType || "",
        author: game.seller?.name || "Inconnu",
        image: getValidImageByType(game.title, game.keyImages, 'OfferImageWide'),
        thumbnail: getValidImageByType(game.title, game.keyImages, 'Thumbnail'),
        url: game.productSlug
          ? `https://store.epicgames.com/fr/p/${game.productSlug}`
          : "https://store.epicgames.com/fr/free-games",
        originalPrice: game.price?.totalPrice?.originalPrice ?? 0,
        discountPrice: game.price?.totalPrice?.discountPrice ?? 0,
      };

      // ✅ Si un jeu est gratuit actuellement
      const current = game.promotions.promotionalOffers;
      if (current?.[0]?.promotionalOffers?.[0]) {
        const offer = current[0].promotionalOffers[0];
        currentGames.push({
          ...base,
          startDate: offer.startDate,
          endDate: offer.endDate,
          status: "currentGames",     // 🔖 Statut pour trier
          color: 2123412              // 🎨 Couleur (ex : embed)
        });
      }

      // ⏳ Si un jeu est prévu prochainement
      const next = game.promotions.upcomingPromotionalOffers;
      if (next?.[0]?.promotionalOffers?.[0]) {
        const offer = next[0].promotionalOffers[0];
        nextGames.push({
          ...base,
          startDate: offer.startDate,
          endDate: offer.endDate,
          status: "nextGames",        // 🔖 Statut pour trier
          color: 10038562             // 🎨 Couleur (ex : embed)
        });
      }
    }

    return { currentGames, nextGames };

  } catch (err) {
    // 🚨 Gestion des erreurs
    console.error("❌ Erreur lors de la récupération des jeux :", err.message);
    return { currentGames: [], nextGames: [] };
  }
}

// 🚀 Export de la fonction principale
module.exports = { getFreeEpicGames };
