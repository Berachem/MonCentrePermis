# Commandes utiles

Installer les dépendances :

```
 composer install
```

Créer une migration :

```
 php bin/console make:migration
```

Exécuter les migrations :

```
 php bin/console doctrine:migrations:migrate
```

Créer une entité :

```
 php bin/console make:entity
```

Démarrer le serveur local :

```
 symfony serve
```

Vider le cache :

```
 php bin/console cache:clear
```

Créer un contrôleur :

```
 php bin/console make:controller
```

Générer les CRUD :

```
 php bin/console make:crud
```

Vérifier l'état de la base de données :

```
 php bin/console doctrine:schema:validate
```

Afficher la liste des routes :

```
 php bin/console debug:router
```

Lister les services disponibles :

```
 php bin/console debug:container
```

Créer une authentification :

```
 php bin/console make:auth
```

# Installation

Ce projet est une API créée avec Symfony pour servir de backend à une application React. Le backend est développé avec une architecture 100% API.

## Prérequis

Assurez-vous d'avoir les outils suivants installés sur votre machine avant de commencer l'installation :

SUIVRE : https://symfony.com/doc/current/setup.html#:~:text=Installing%20%26%20Setting%20up%20the%20Symfony%20Framework

- PHP 8.2.1 : https://www.php.net/downloads.php
- Composer : https://getcomposer.org/download/
- Symfony CLI : https://symfony.com/download
- MySQL ou un autre SGBD compatible : https://dev.mysql.com/downloads/
- Node.js (facultatif, pour certains packages Symfony) : https://nodejs.org/en/download/
