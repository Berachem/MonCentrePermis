# Commandes utiles

Installer les dépendances : (important)

```
 composer install
```

Créer la base de données :

```
 php bin/console doctrine:database:create
```

Créer les tables :

```
 php bin/console doctrine:migrations:migrate
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

# Connection à la base de données

## Installer PostgreSQL

> INSTALLER VERSION 17 de PostgreSQL : https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

- Ouvrez le fichier php.ini : C:\path\to\php\php.ini
- Cherchez la ligne -> `;extension=pdo_pgsql` et la décommenté comme ceci -> `extension=pdo_pgsql` (Cela permet d'activer l'extension)

- Redémarrer Symfony :

  ```
  symfony server:stop
  symfony server:start
  ```

- Ouvrez le fichier .env -> /backend/.env , modifier la variable "DATABASE_URL" :
  `DATABASE_URL="postgresql://username:password@127.0.0.1:5432/BDD_NAME?serverVersion=17&charset=utf8"`
  - username : Nom de votre user sur PostgreSQL
  - password : Mot de passe de votre user sur PostgreSQL
  - BDD_NAME : Nom que vous avez donné à votre base de données

### Extension pour géré votre base de données (Plus simple que pgAdmin 4)

- Dans la barre de recherche des extensions VS code entrez -> `ckolkman.vscode-postgres`
- Assurez-vous qu'elle soit bien dans votre tool bar gauche de VS, un logo éléphant
- Télécharger là, ajouter une connection à votre base de données
- Vous aurez besoins :
  - username (BDD)
  - password (BDD)
  - Adresse (BDD) soit : `127.0.0.1`
  - Port (BDD) soit : `5432` (PostgreSQL est toujours sur ce port)

```

```
