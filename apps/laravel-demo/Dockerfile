FROM php:8.4-cli-alpine

# Install system dependencies & SQLite PDO extensions
RUN apk add --no-cache \
    sqlite \
    sqlite-dev \
    sqlite-libs \
    curl \
    git \
    unzip \
    bash \
    && docker-php-ext-install pdo pdo_sqlite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy packages/laravel for path repository dependency
COPY packages/laravel /packages/laravel

# Copy application source
COPY apps/laravel-demo/ /var/www/

# Configure composer path repository to /packages/laravel in container
RUN composer config repositories.local '{"type": "path", "url": "/packages/laravel"}'

# Install production dependencies
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Pre-create directories and seed SQLite database
RUN mkdir -p database bootstrap/cache storage/framework/views storage/framework/sessions storage/framework/cache storage/logs \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage database bootstrap/cache \
    && chmod -R 775 storage database bootstrap/cache \
    && php artisan migrate --force \
    && php artisan db:seed --force

# Default Render free tier port
ENV PORT=10000
EXPOSE 10000

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT:-10000}/api/health || exit 1

# Start built-in PHP server (tailored for lightweight Render free tier)
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]
