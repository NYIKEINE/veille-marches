# Marchés & Finance — comptes rendus

Site qui affiche les veilles marchés quotidiennes (CAC 40, crypto, or) de Catherine.

## Comment ça marche

- `comptes-rendus/AAAA-MM-JJ.md` : une veille par jour (la source, un fichier par date).
- `_template.html` : le design du site.
- `build-site.mjs` : régénère `index.html` à partir de tous les fichiers du dossier `comptes-rendus/`.
- `index.html` : la page servie en ligne (générée, ne pas modifier à la main).

## Mise à jour

Chaque matin à 6h06, la routine `routine-du-matin` :
1. écrit la veille du jour dans `comptes-rendus/`,
2. lance `node build-site.mjs`,
3. `git push` vers GitHub, ce qui déclenche le redéploiement automatique sur Vercel.

Pour régénérer et publier à la main :

```
node build-site.mjs
git add -A
git commit -m "Veille du jour"
git push
```
