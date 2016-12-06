#!/bin/bash

echo "Download certbot-auto into /usr/local/bin"
curl https://dl.eff.org/certbot-auto > /usr/local/bin/certbot-auto

echo "Make /usr/local/bin/certbot-auto executable..."
chmod a+x /usr/local/bin/certbot-auto

echo "Requesting certificate via letsencrypt (certbot)..."

# Create a letsencrypt certificate
# NOTE: directories are based on the containers
certbot-auto certonly \
    --non-interactive \
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

echo "Restarting docker-compose..."
docker-compose restart

echo "Switch to HTTPS-only nginx configuration..."
docker-compose exec nginx switch-to-https-only

echo "Done."
