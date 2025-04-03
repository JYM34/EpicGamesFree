# 🕹️ EpicGamesFree

Script Node.js permettant de récupérer les jeux gratuits actuels et à venir sur l’Epic Games Store via leur API publique.  
Il formate proprement les données pour intégration facile (Discord bot, frontend, etc.).

---

## 🚀 Fonctionnalités

- 🔍 Récupération des jeux gratuits (`currentGames`)
- 📅 Prévisualisation des futurs jeux gratuits (`nextGames`)
- 🧠 Filtrage intelligent : offre active, jeu gratuit, base game uniquement
- 🎨 Mise en forme : titre, description, prix, image, auteur, dates, slug, etc.
- 📦 Intégrable facilement dans une API, un bot Discord, un frontend...

---

## 🛠️ Utilisation

### Installation

```bash
git clone https://github.com/ton-user/ton-repo.git
cd ton-repo
npm install
```

### Exemple simple (`test.js`)

```js
const { getEpicFreeGames } = require('./index');

getEpicFreeGames({ country: 'FR', locale: 'fr', includeAll: false })
  .then(({ currentGames, nextGames }) => {
    console.log('🎮 Jeux gratuits actuels :', currentGames.length);
    console.log('⏳ Jeux à venir :', nextGames.length);
  })
  .catch(console.error);
```

---

## 📦 Format de sortie

Chaque jeu est renvoyé sous cette forme :

```json
{
  "title": "Cat Quest II",
  "description": "...",
  "author": "Epic Dev Test Account",
  "offerType": "OTHERS",
  "url": "https://store.epicgames.com/fr/p/cat-quest-ii-9dbefc",
  "effectiveDate": "2025-04-03T15:00:00.000Z",
  "expiryDate": "2025-04-10T15:00:00.000Z",
  "thumbnail": "https://...",
  "price": "0",
  "image": "https://...",
  "status": "currentGames",
  "color": 2123412
}
```

> 💡 Parfait pour générer des embeds Discord ou afficher dans une UI.

---

## 📁 Structure

```
.
├── index.js                # Fonction principale getEpicFreeGames()
├── test.js                # Script de test rapide
├── Fonctions/
│   └── imageUtils.js      # Sélection intelligente d'images + cache
```

---

## ⚙️ Options

| Option      | Type    | Par défaut | Description                              |
|-------------|---------|------------|------------------------------------------|
| `country`   | string  | `"FR"`     | Pays utilisé pour filtrer les offres     |
| `locale`    | string  | `"fr-FR"`  | Langue des résultats                     |
| `includeAll`| boolean | `false`    | Inclure tous les types d’offres (`true`) |

---

## ✅ Roadmap possible

- [ ] Ajout d’un cache disque/local
- [ ] Ajout de tests automatisés (Jest)
- [ ] Intégration avec un bot Discord
- [ ] Export au format Markdown / RSS / JSON API

---

## 🧪 Test local

```bash
node test.js
```

---

## 📄 Licence

MIT – fais-en bon usage.

---

## ✨ Auteur

Développé par [TonNom ou Handle] – qualité & clarté avant tout ⚙️
