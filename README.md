# Baraka — évolution 2

Cette version améliore l'interface de démonstration avec :
- notes et tâches enregistrées localement dans le navigateur ;
- création et suppression de projets ;
- tableau de bord et éléments récents ;
- dictée vocale si le navigateur la prend en charge ;
- base PWA avec manifeste et service worker.

## Mise à jour du dépôt GitHub

Dans le dépôt `Baraka`, remplace les fichiers existants par ceux de ce dossier :
`index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js`.
Ajoute aussi `README.md`.

Si GitHub affiche un fichier de même nom, choisis de le remplacer ou de modifier son contenu. Ne crée pas un deuxième dépôt.

## Important : limites actuelles

Cette version ne contient pas encore de connexion à une IA, de synchronisation cloud, de notifications garanties ni de véritable agenda connecté. Les données sont conservées dans le stockage local du navigateur : vider les données du site peut les effacer. Fais des sauvegardes avant de changer de version.

Pour ajouter une IA, il faudra ensuite un petit serveur/API sécurisé. Ne place jamais une clé API dans `app.js` ni dans un dépôt public.

## Licence

MIT — voir `LICENSE`.
