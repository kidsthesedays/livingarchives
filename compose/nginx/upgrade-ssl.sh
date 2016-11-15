#!/bin/bash
set -e

echo "Requesting certificate via letsencrypt (certbot)..."
# Create a letsencrypt certificate
certbot-auto certonly \
    --email sebastianbengtegard@gmail.com \
    --agree-tos \
    --webroot \
    -t \
    -w /opt/sites/livingarchives \
        -d livingarchives.org \
        -d www.livingarchives.org \
    -w /opt/sites/skybox \
        -d skybox.livingarchives.org \
    -w /opt/node \
        -d alberta.livingarchives.org \
        -d api.livingarchives.org

echo "Swapping nginx configuration from development to production"
# Move configuration for development
mv /etc/nginx/servers.nginx /etc/nginx/servers-dev.nginx
# Move configuration for production
mv /etc/nginx/servers-prod.nginx /etc/nginx/servers.nginx
# Reload nginx
echo "Reloading nginx..."
nginx -s reload
