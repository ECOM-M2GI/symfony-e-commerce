# IM2AG-e-commerce

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

## Mise en prod

### API Website
Pour le site de l'API, il faut modifier le dossier racine du site dans infomaniak pour que ce /public, où se trouve le fichier index.php, et ajouter un fichier .htaccess avec la config minimale suivante : 
```
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

### Frontend Website


### JWT

#### Remettre un timeout sur le token dans api/config/packages/lexik_jwt_authentication.yaml

#### Ajouter la configuration nécessaire pour apache : [Doc Symfony](https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html#important-note-for-apache-users)

#### Refaire le JWT avant la mise en prod avec une nouvelle passphrase, en preprod c'est password

https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html#generate-the-ssl-keys
