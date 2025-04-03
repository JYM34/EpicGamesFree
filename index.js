// epicFreeGames.js
const axios = require('axios');
const dayjs = require('dayjs');
const { getValidImageByType } = require('./Fonctions/imageUtils');

const defaultOptions = {
  country: 'FR',
  locale: 'fr-FR',
  includeAll: false
};

async function getEpicFreeGames(options = {}) {
  const { country, locale, includeAll } = { ...defaultOptions, ...options };

  const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions', {
    params: { country, locale }
  });

  const elements = response?.data?.data?.Catalog?.searchStore?.elements || [];

  const isBaseGame = (game) => includeAll || game.offerType === 'BASE_GAME' || 'OTHERS';
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

  // 🎯 Formattage final des jeux pour n’exposer que l’essentiel
  const formatGame = (game, status, color) => {
    const promo =
      game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] ||
      game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
  
    return {
      title: game.title,
      description: game.description,
      author: game.seller?.name || "Inconnu",
      offerType: game.offerType || "",
      url: game.productSlug
          ? `https://store.epicgames.com/fr/p/${game.productSlug}`
          : "https://store.epicgames.com/fr/free-games",
      effectiveDate: promo?.startDate || game.effectiveDate,
      expiryDate: promo?.endDate || game.expiryDate,
      thumbnail: getValidImageByType(game.title, game.keyImages, 'Thumbnail'),
      price: game.price?.totalPrice?.fmtPrice?.discountPrice || '0',
      image: getValidImageByType(game.title, game.keyImages, 'OfferImageWide'),
      status, // 🔖 Exemple : "currentGames" ou "nextGames"
      color
    };
  };

  const currentGames = elements
    .filter(game => isBaseGame(game) && isFree(game) && hasCurrentPromotion(game))
    .map(game => formatGame(game, 'currentGames', 2123412));

  const nextGames = elements
    .filter(game => isBaseGame(game) && willBeFree(game) && hasUpcomingPromotion(game))
    .map(game => formatGame(game, 'nextGames', 10038562));

  return { currentGames, nextGames };
}

module.exports = { getEpicFreeGames };
