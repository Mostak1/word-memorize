FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git curl unzip zip libzip-dev \
    libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libicu-dev libonig-dev libxml2-dev

RUN docker-php-ext-install \
    pdo_mysql mbstring bcmath exif pcntl zip intl

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www