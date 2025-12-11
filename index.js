// epicFreeGames.js

// 📦 Dépendances
const axios = require('axios');
const dayjs = require('dayjs');
const { getValidImageByType } = require('./Fonctions/imageUtils');

// ⚙️ Fallback par défaut
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
 * 🎮 Récupère les jeux gratuits d'Epic Games
 */
async function getEpicFreeGames(options = {}) {
  const now = Date.now();

  // ✅ Utilisation du cache
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  const { guildConfig = {}, includeAll = false } = options;
  const country = guildConfig.country || defaultOptions.country;
  const locale = guildConfig.locale || defaultOptions.locale;

  // 🌐 Requête API
  const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions', {
    params: { country, locale }
  });

  const elements = response?.data?.data?.Catalog?.searchStore?.elements || [];

  // 🧪 Filtres
  const isBaseGame = (game) => includeAll || game.offerType === 'BASE_GAME' || game.offerType === 'OTHERS' || game.offerType === 'EDITION';
  const isFree = (game) => game.price?.totalPrice?.discountPrice === 0;

  const hasCurrentPromotion = (game) => {
    const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().isAfter(promo.startDate) && dayjs().isBefore(promo.endDate);
  };

  // 🛠️ CORRECTION ICI : On veut juste savoir si ça commence dans le futur
  const hasUpcomingPromotion = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    // On garde simplement ceux dont la date de début est après "maintenant"
    return dayjs(promo.startDate).isAfter(dayjs());
  };

  const willBeFree = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    return promo?.discountSetting?.discountPercentage === 0;
  };

  // 🎨 Formatage
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

  // 🎮 Jeux actuels
  const currentGames = elements
    .filter(game => isBaseGame(game) && isFree(game) && hasCurrentPromotion(game))
    .map(game => formatGame(game, 'currentGames', 0x3498db));

  // 🕒 Jeux futurs
  const nextGames = elements
    .filter(game => isBaseGame(game) && willBeFree(game) && hasUpcomingPromotion(game))
    .map(game => formatGame(game, 'nextGames', 0x9b59b6))
    // 🛠️ AJOUT DE SÉCURITÉ : Tri par date croissante (le plus proche en premier)
    .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));

  const result = { currentGames, nextGames };

  // 🧠 Mise à jour cache
  cache = {
    data: result,
    timestamp: now
  };

  return result;
}

module.exports = { getEpicFreeGames };
