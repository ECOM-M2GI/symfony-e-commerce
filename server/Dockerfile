# =========================================
# Stage 1: Frontend - Angular build
# =========================================

ARG NODE_VERSION=22.14.0-alpine

# Set the an intermediaire  image for development
FROM node:${NODE_VERSION} AS node-build

WORKDIR /app

COPY frontend/package.json /frontend/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm install

# Copy all application source files into the container
COPY frontend .

ARG PROJECT_NAME=ebey

RUN npm run build -- --configuration production


# =========================================
# Stage 2: Backend - Apache + PHP/Symfony
# =========================================
FROM php:8.2-apache 
ARG PROJECT_NAME=ebey

WORKDIR .

RUN a2enmod rewrite

RUN apt-get update \
  && apt-get install -y libzip-dev git wget unzip --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
 
RUN docker-php-ext-install pdo mysqli pdo_mysql zip;

RUN wget https://getcomposer.org/download/2.8.3/composer.phar \ 
    && mv composer.phar /usr/bin/composer && chmod +x /usr/bin/composer

# Copy the built Angular application from the previous stage to apache HTML directory
COPY --from=node-build /app/dist/${PROJECT_NAME}/browser /var/www/html

COPY api/ /var/www/api
# Copy .env file to the parent directory where Symfony expects it
COPY api/.env /var/www/.env
COPY server/apache.conf /etc/apache2/sites-enabled/000-default.conf 

WORKDIR /var/www

# Set permissions for Symfony cache and logs
RUN mkdir -p /var/www/api/var/cache /var/www/api/var/log \
    && chown -R www-data:www-data /var/www/api/var \
    && chmod -R 775 /var/www/api/var

# Set permissions for JWT keys if they exist
RUN if [ -d /var/www/api/config/jwt ]; then \
        chown -R www-data:www-data /var/www/api/config/jwt && \
        chmod 640 /var/www/api/config/jwt/private.pem 2>/dev/null || true && \
        chmod 644 /var/www/api/config/jwt/public.pem 2>/dev/null || true; \
    fi

CMD ["sh", "-c", "composer install -d /var/www/api --no-interaction --optimize-autoloader && apache2-foreground"]