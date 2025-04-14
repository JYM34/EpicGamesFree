const { getEpicFreeGames } = require("./index");
const guildConfig = {
  country: "FR", // ou récupéré dynamiquement via `configs[guildId]`
  locale: "fr-FR"
};

// Exemple d'utilisation
getEpicFreeGames({ guildConfig })
  .then((response) => {
    const elements = response || {};

    const currentGames = elements.currentGames || [];
    const nextGames = elements.nextGames || [];

    const allGames = [...currentGames, ...nextGames];

    console.log(`Nombre d'éléments : ${allGames.length}`);

    allGames.forEach((game, i) => {
      const emoji = game.status === "currentGames" ? "🟢" : "🟡";
      console.log(`
    ${emoji} ${game.title}
       🏷️ Auteur : ${game.author}
       🕒 Du ${game.effectiveDate} au ${game.expiryDate}
       💶 Prix : ${game.price}
       🔗 URL : ${game.url}
    `);
    });

    // Afficher une seule fois l’objet complet si besoin
    console.log("Structure complète des éléments :");
    console.dir(elements, { depth: null });

  })
  .catch(console.error);