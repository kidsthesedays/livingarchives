#!/bin/bash

if ! [ -x "$(command -v certbot)" ]; then
    echo 'Error: Certbot is not installed.' >&2
    exit 1
fi

# Install CERTBOT via:
#   $ sudo apt-get install software-properties-common
#   $ sudo add-apt-repository ppa:certbot/certbot
#   $ sudo apt-get update
#   $ sudo apt-get install certbot 

echo "Running Certbot..."

# Create a letsencrypt certificate
certbot certonly \
    --non-interactive \
    --email sebastianbengtegard@gmail.com \
    --agree-tos \
    --webroot \
    -t \
    -w ./sites/livingarchives.org \
        -d livingarchives.org \
        -d www.livingarchives.org \
    -w ./sites/skybox.livingarchives.org \
        -d skybox.livingarchives.org \
    -w ./sites/affexity.livingarchives.org \
        -d affexity.livingarchives.org \
    -w ./node/statistics-database \
        -d api.livingarchives.org
    -w ./node/finding-alberta \
        -d alberta.livingarchives.org


#    -w ./sites/somatic.livingarchives.org \
#        -d somatic.livingarchives.org \
#     -w ./node/bitter-and-sweet \
#         -d bitterandsweet.livingarchives.org \

while true; do
    read -p "Restart docker-compose? [y/n] " yn
    case $yn in
        [Yy]* ) docker-compose restart; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

while true; do
    read -p "Switch to HTTPS-only nginx configuration? [y/n] " yn
    case $yn in
        [Yy]* ) docker-compose exec nginx switch-to-https-only; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "Done."
