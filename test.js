const { getFreeEpicGames } = require("./index");

(async () => {
  const { currentGames, nextGames } = await getFreeEpicGames();
  console.clear();
  console.log("🎮 Jeux actuels :");
  console.table(currentGames.map(g => ({ 
    title: g.title, 
    date: g.startDate,
    author: g.author,
    status: g.status,
    offerType: g.offerType,
    url: g.url 
  })));

  console.log("\n⏳ Jeux à venir :");
  console.table(nextGames.map(g => ({ 
    title: g.title, 
    date: g.startDate,
    author: g.author,
    status: g.status,
    offerType: g.offerType,
    url: g.url 
  })));

})();