# 🎮 EpicGamesFree

> Module Node.js pour récupérer les jeux gratuits du Epic Games Store (actuels et à venir).

<p align="left">
  <img src="https://ftp.nkconcept.fr/epicgames-logo.png" width="80" alt="Logo EpicGamesFree">
</p>

---

## ✨ Fonctionnalités

- Récupère les jeux actuellement **gratuits**
- Récupère les jeux **à venir** (gratuits bientôt)
- Retourne un objet structuré `currentGames[]` et `nextGames[]`
- Donne accès à : titre, description, image, date, prix, URL, etc.
- Gestion intelligente des images (image principale et miniature)
- Image personnalisée pour les jeux "Mystery Game"
- Fallback automatique si aucune image valide n’est disponible

---

## 🔧 Installation

```bash
npm install epic-games-free
```

---

## 🧪 Utilisation simple

```js
const { getFreeEpicGames } = require("epic-games-free");

(async () => {
  const { currentGames, nextGames } = await getFreeEpicGames();

  console.log("Jeux gratuits en cours :");
  console.table(currentGames);

  console.log("Prochains jeux gratuits :");
  console.table(nextGames);
})();
```

---

## 🔁 Format retourné (exemple)

```js
{
  title: 'The Game',
  description: 'Un super jeu gratuit',
  author: 'Ubisoft',
  image: 'https://cdn.epicgames.com/...',
  url: 'https://store.epicgames.com/fr/p/the-game',
  startDate: '2025-04-01T16:00:00.000Z',
  endDate: '2025-04-08T16:00:00.000Z',
  status: 'currentGames',
  originalPrice: 1999,
  discountPrice: 0
}
```

---

## 📄 Licence

MIT

---

## 🧠 Crédits

Données récupérées depuis le site public :  
[https://store.epicgames.com/fr/free-games](https://store.epicgames.com/fr/free-games)