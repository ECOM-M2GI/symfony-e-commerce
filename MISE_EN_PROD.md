
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
Faire la même chose avec un fichier .htaccess dans le dossier racine du site frontend qui redirige vers index.html

### JWT

#### Remettre un timeout sur le token dans api/config/packages/lexik_jwt_authentication.yaml

#### Ajouter la configuration nécessaire pour apache : [Doc Symfony](https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html#important-note-for-apache-users)

#### Refaire le JWT avant la mise en prod avec une nouvelle passphrase, en preprod c'est password

https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html#generate-the-ssl-keys
