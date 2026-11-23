# BARAKA INITIATIVE — première étape

Ce paquet ajoute :
- un panneau « Baraka Initiative » sur le tableau de bord ;
- des suggestions locales basées sur les tâches, notes et projets déjà stockés dans le navigateur ;
- un bouton qui demande l'autorisation des notifications et affiche une notification de test.

## Installation
Remplace dans le dépôt GitHub les fichiers `index.html`, `app.js`, `style.css` et `sw.js` par ceux de ce paquet. Conserve `manifest.webmanifest` et les autres fichiers existants.

## Important : limites de cette première étape
Les suggestions sont calculées localement avec des règles simples. Ce n'est pas encore une IA générative.
Le bouton de notification vérifie l'autorisation et affiche une notification de test. Il ne programme pas encore des notifications automatiques lorsque le site est fermé.

Pour recevoir de vraies notifications proactives en arrière-plan, il faudra ajouter :
1. une installation PWA sur l'écran d'accueil de l'iPhone (Safari > Partager > Sur l'écran d'accueil) ;
2. un serveur HTTPS avec Web Push et des clés VAPID ;
3. un stockage sécurisé des abonnements Push et un mécanisme de planification ;
4. une interface de désinscription et de gestion de la fréquence.

Sur iPhone, les notifications Web Push nécessitent une web-app ajoutée à l'écran d'accueil et une version iOS compatible. L'autorisation doit être demandée après une action explicite de l'utilisateur.

## Confidentialité
Cette version n'envoie aucune note, tâche ou donnée personnelle à un serveur. Les suggestions sont générées sur l'appareil.
