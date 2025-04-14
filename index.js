// epicFreeGames.js

// 📦 Dépendances
const axios = require('axios');                   // Pour effectuer les requêtes HTTP
const dayjs = require('dayjs');                   // Pour gérer et comparer des dates facilement
const { getValidImageByType } = require('./Fonctions/imageUtils'); // Sélection d'images optimisée

// ⚙️ Options par défaut pour la requête
const defaultOptions = {
  country: 'FR',        // Pays ciblé (permet de filtrer les jeux selon les régions)
  locale: 'fr-FR',      // Langue des résultats
  includeAll: false     // Inclure tous les types d’offres ou seulement les "BASE_GAME"
};

// 🧠 Cache mémoire simple pour éviter les appels répétés à l’API
let cache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 1000 * 60 * 5; // Durée du cache en millisecondes (5 minutes)

/**
 * 🎮 Fonction principale pour récupérer les jeux gratuits (actuels et à venir)
 * @param {Object} options - Personnalisation possible (country, locale, includeAll)
 * @returns {Object} - currentGames et nextGames
 */
async function getEpicFreeGames(options = {}) {
  const now = Date.now();

  // ✅ Si les données sont en cache et valides → on retourne le cache
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  // 📋 Fusion des options par défaut et de celles fournies par l'utilisateur
  const { country, locale, includeAll } = { ...defaultOptions, ...options };

  // 🌐 Requête vers l’API publique d’Epic Games
  const response = await axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions', {
    params: { country, locale }
  });

  // 📦 Liste des jeux récupérés depuis la réponse de l’API
  const elements = response?.data?.data?.Catalog?.searchStore?.elements || [];

  /**
   * 🔍 Vérifie si le jeu est de type "BASE_GAME" (ou autre si includeAll est activé)
   * @param {Object} game
   * @returns {boolean}
   */
  const isBaseGame = (game) => includeAll || game.offerType === 'BASE_GAME' || game.offerType === 'OTHERS';

  /**
   * 💸 Vérifie si le jeu est actuellement gratuit
   * @param {Object} game
   * @returns {boolean}
   */
  const isFree = (game) => game.price?.totalPrice?.discountPrice === 0;

  /**
   * 📆 Vérifie si une promotion est en cours sur ce jeu
   * @param {Object} game
   * @returns {boolean}
   */
  const hasCurrentPromotion = (game) => {
    const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().isAfter(promo.startDate) && dayjs().isBefore(promo.endDate);
  };

  /**
   * ⏳ Vérifie si une promotion est prévue dans la semaine à venir
   * @param {Object} game
   * @returns {boolean}
   */
  const hasUpcomingPromotion = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    if (!promo) return false;
    return dayjs().add(1, 'week').isAfter(promo.startDate) && dayjs().add(1, 'week').isBefore(promo.endDate);
  };

  /**
   * 🎁 Vérifie si le jeu à venir sera gratuit (discount = 100%)
   * @param {Object} game
   * @returns {boolean}
   */
  const willBeFree = (game) => {
    const promo = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    return promo?.discountSetting?.discountPercentage === 0;
  };

  /**
   * 🎨 Formate les données d’un jeu pour n’exposer que les infos utiles
   * @param {Object} game - Objet brut du jeu
   * @param {string} status - "currentGames" ou "nextGames"
   * @param {number} color - Code couleur à utiliser dans l’embed
   * @returns {Object}
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
      url: game.productSlug
        ? `https://store.epicgames.com/fr/p/${game.productSlug}`
        : "https://store.epicgames.com/fr/free-games",
      effectiveDate: promo?.startDate || game.effectiveDate,
      expiryDate: promo?.endDate || game.expiryDate,
      thumbnail: getValidImageByType(game.title, game.keyImages, 'Thumbnail'),
      price: game.price?.totalPrice?.fmtPrice?.discountPrice || '0',
      image: getValidImageByType(game.title, game.keyImages, 'OfferImageWide'),
      status, // Exemple : "currentGames" ou "nextGames"
      color
    };
  };

  // 🎮 Jeux actuellement gratuits
  const currentGames = elements
    .filter(game => isBaseGame(game) && isFree(game) && hasCurrentPromotion(game))
    .map(game => formatGame(game, 'currentGames', 0x206694)); // 💙 Couleur bleue

  // ⏳ Jeux qui seront gratuits prochainement
  const nextGames = elements
    .filter(game => isBaseGame(game) && willBeFree(game) && hasUpcomingPromotion(game))
    .map(game => formatGame(game, 'nextGames', 0x9b59b6)); // 💜 Couleur violette

  const result = { currentGames, nextGames };

  // 🔁 Mise en cache du résultat
  cache = {
    data: result,
    timestamp: now
  };

  return result;
}

// 📤 Export de la fonction principale
module.exports = { getEpicFreeGames };
