# IM2AG-e-commerce

## Le projet

Le projet ECOM est un projet d'application e-commerce qui nous a été demandé de faire comme premier projet de l'année de Master 2 Génie Informatique à L'UGA.

Nous avons fais en groupe un projet de site de vente de location, que nous avons appelé Ebey, vous pouvez trouver le code source de ce projet initial au lien suivant : https://gitlab.com/TxMat/im2ag-e-commerce.git.
Pour ce projet nous avons utilisé les technologies Django pour créer une API et Angular pour gérer le front-end et les appels API.

Cependant, je voulais héberger ce projet sur mon hébergeur infomaniak, mais je ne peux héberger que des applications PHP. J'ai donc décidé de faire le passage vers Symfony, ce qui m'a permis d'apprendre tout en rendant ce projet accessible sur mon hébergeur.

L'API est donc actuellement faite en Symfony et le front-end toujours avec Angular.
Vous pouvez trouver le site héberger et utilisable au lien suivant : https://ecom.babolat-loic.fr/

Il y a quelque différence avec le projet initial, j'ai par exemple ajouté un système de pagination dans la page de recherche et j'ai implémenté l'authentification avec les tokens JWT. J'ai également retiré la fonctionnalité d'ajout d'image, c'est-à-dire que les utilisateurs ne peuvent plus ajouter d'images pour leurs produits, j'ai fais cela par gain de temps.

## Docker

### Getting started on dev mode

```bash
docker compose up frontend-dev webserver-dev mariadb
```

### Getting started on production mode 

```bash
docker compose up webserver mariadb
```

#### Access Docker Bash

```bash
docker exec -it <mycontainer> sh
```
Pour la console de dev
```bash
docker exec -it symfony-e-commerce-webserver-dev-1 sh
```

#### Database Export

```bash
docker exec <mycontainer> /usr/bin/mysqldump -u root --password=rootpassword annonces > backup.sql
```


#### Stop the project

```bash
docker compose down
```

## Symfony

### Mettre à jour le schema de la base de données
```bash
php bin/console doctrine:schema:update --force
```

### Ajouter des données à partir des fixtures
```bash
php bin/console doctrine:fixtures:load
```
