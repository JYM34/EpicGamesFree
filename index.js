// epicFreeGames.js

// 📦 Dépendances
const axios = require('axios');
const dayjs = require('dayjs');
const { getValidImageByType } = require('./Fonctions/imageUtils');

// ⚙️ Fallback par défaut (en cas d’absence de config serveur)
const defaultOptions = {
  country: 'FR',
  locale: 'fr-FR',
  includeAll: false
};

// 🧠 Cache mémoire
let cache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

/**
 * 🎮 Récupère les jeux gratuits d'Epic Games (avec config serveur personnalisée)
 * @param {Object} options - Peut contenir : guildConfig, includeAll
 * @returns {Object} - Liste des currentGames et nextGames
 */
async function getEpicFreeGames(options = {}) {
  const now = Date.now();

  // ✅ Utilisation du cache si encore valable
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  // 🔧 Extraction des paramètres personnalisés ou fallback
  const { guildConfig = {}, includeAll = false } = options;

  // 🌍 Pays + langue à utiliser
  const country = guildConfig.country || defaultOptions.country;
  const locale = guildConfig.locale || defaultOptions.locale;

  // 🌐 Requête vers l’API Epic Games
  const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions', {
    params: { country, locale }
  });

  const elements = response?.data?.data?.Catalog?.searchStore?.elements || [];

  // 🧪 Fonctions utilitaires de filtrage
  const isBaseGame = (game) => includeAll || game.offerType === 'BASE_GAME' || game.offerType === 'OTHERS';
  const isFree = (game) => game.price?.totalPrice?.discountPrice === 0;

  const hasCurrentPromotion = (game) => {
    const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().isAfter(promo.startDate) && dayjs().isBefore(promo.endDate);
  };

  const hasUpcomingPromotion = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().add(1, 'week').isAfter(promo.startDate) && dayjs().add(1, 'week').isBefore(promo.endDate);
  };

  const willBeFree = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    return promo?.discountSetting?.discountPercentage === 0;
  };

  /**
   * 🎨 Formatte un jeu avec les données utiles pour Discord ou UI
   */
  const formatGame = (game, status, color) => {
    const promo =
      game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] ||
      game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];

    return {
      title: game.title,
      description: game.description,
      author: game.seller?.name || "Inconnu",
      offerType: game.offerType || "",
      url: game.catalogNs?.mappings?.[0]?.pageSlug
        ? `https://store.epicgames.com/${locale.split('-')[0]}/p/${game.catalogNs.mappings[0].pageSlug}`
        : `https://store.epicgames.com/${locale.split('-')[0]}/free-games`,
      effectiveDate: promo?.startDate || game.effectiveDate,
      expiryDate: promo?.endDate || game.expiryDate,
      thumbnail: getValidImageByType(game.title, game.keyImages, 'Thumbnail'),
      price: game.price?.totalPrice?.fmtPrice?.discountPrice || '0',
      image: getValidImageByType(game.title, game.keyImages, 'OfferImageWide'),
      status,
      color
    };
  };

  // 🎮 Jeux gratuits disponibles maintenant
  const currentGames = elements
    .filter(game => isBaseGame(game) && isFree(game) && hasCurrentPromotion(game))
    .map(game => formatGame(game, 'currentGames', 0x3498db)); // 💙

  // 🕒 Jeux qui seront gratuits bientôt
  const nextGames = elements
    .filter(game => isBaseGame(game) && willBeFree(game) && hasUpcomingPromotion(game))
    .map(game => formatGame(game, 'nextGames', 0x9b59b6)); // 💜

  const result = { currentGames, nextGames };

  // 🧠 Mise à jour du cache
  cache = {
    data: result,
    timestamp: now
  };

  return result;
}

module.exports = { getEpicFreeGames };