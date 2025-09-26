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

ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install -d /var/www/api --no-dev --optimize-autoloader

COPY server/apache.conf /etc/apache2/sites-enabled/000-default.conf 

WORKDIR /var/www

CMD ["apache2-foreground"]