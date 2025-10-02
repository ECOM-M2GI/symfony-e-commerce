# IM2AG-e-commerce

## Getting started on dev mode

```bash
docker compose up frontend-dev webserver-dev mariadb
```

## Getting started on production mode

```bash
docker compose up webserver mariadb
```

### Access Docker Bash

```bash
docker exec -it <mycontainer> sh
```

### Database Export

```bash
docker exec CONTAINER /usr/bin/mysqldump -u root --password=rootpassword annonces > backup.sql
```


### Stop the project

```bash
docker compose down
```

## License

[GPL-V3](https://www.gnu.org/licenses/gpl-3.0.fr.html#license-text)
