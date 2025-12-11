// epicFreeGames.js

// 📦 Dépendances
const axios = require('axios');
const dayjs = require('dayjs');
// On importe ta super fonction d'image
const { getValidImageByType } = require('./Fonctions/imageUtils'); 

const defaultOptions = {
  country: 'FR',
  locale: 'fr-FR',
  includeAll: false
};

let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 1000 * 60 * 5; 

async function getEpicFreeGames(options = {}) {
  const now = Date.now();

  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  const { guildConfig = {}, includeAll = false } = options;
  const country = guildConfig.country || defaultOptions.country;
  const locale = guildConfig.locale || defaultOptions.locale;

  const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions', {
    params: { country, locale }
  });

  const elements = response?.data?.data?.Catalog?.searchStore?.elements || [];

  const isBaseGame = (game) => includeAll || game.offerType === 'BASE_GAME' || game.offerType === 'OTHERS' || game.offerType === 'EDITION';
  const isFree = (game) => game.price?.totalPrice?.discountPrice === 0;

  const hasCurrentPromotion = (game) => {
    const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().isAfter(promo.startDate) && dayjs().isBefore(promo.endDate);
  };

  // ✅ CORRECTION 1 : La logique simplifiée pour les jeux futurs (fonctionne pour les jeux quotidiens)
  const hasUpcomingPromotion = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    // On prend tout ce qui commence dans le futur
    return dayjs(promo.startDate).isAfter(dayjs());
  };

  const willBeFree = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    return promo?.discountSetting?.discountPercentage === 0;
  };

  const formatGame = (game, status, color) => {
    const promo =
      game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] ||
      game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];

    return {
      title: game.title,
      description: game.description, // Tu peux personnaliser ici si tu veux changer la description des jeux mystères
      author: game.seller?.name || "Inconnu",
      offerType: game.offerType || "",
      url: game.catalogNs?.mappings?.[0]?.pageSlug
        ? `https://store.epicgames.com/${locale.split('-')[0]}/p/${game.catalogNs.mappings[0].pageSlug}`
        : `https://store.epicgames.com/${locale.split('-')[0]}/free-games`,
      effectiveDate: promo?.startDate || game.effectiveDate,
      expiryDate: promo?.endDate || game.expiryDate,
      
      // ✅ APPEL DE TON SCRIPT D'IMAGES
      // Il va gérer tout seul le cas "Mystery" grâce à ton if(isMysteryGame)
      thumbnail: getValidImageByType(game.title, game.keyImages, 'Thumbnail'),
      image: getValidImageByType(game.title, game.keyImages, 'OfferImageWide'),
      
      price: game.price?.totalPrice?.fmtPrice?.discountPrice || '0',
      status,
      color
    };
  };

  const currentGames = elements
    .filter(game => isBaseGame(game) && isFree(game) && hasCurrentPromotion(game))
    .map(game => formatGame(game, 'currentGames', 0x3498db));

  const nextGames = elements
    .filter(game => isBaseGame(game) && willBeFree(game) && hasUpcomingPromotion(game))
    .map(game => formatGame(game, 'nextGames', 0x9b59b6))
    // ✅ CORRECTION 2 : Le tri indispensable pour ne pas sauter le Mystery Game 1
    .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));

  const result = { currentGames, nextGames };

  cache = { data: result, timestamp: now };
  return result;
}

module.exports = { getEpicFreeGames };
