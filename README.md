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