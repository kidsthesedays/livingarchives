#!/bin/bash

echo "Download certbot-auto into /usr/local/bin"
curl https://dl.eff.org/certbot-auto > ./certbot-auto

echo "Make ./certbot-auto executable..."
chmod a+x ./certbot-auto

echo "Requesting certificate via letsencrypt (certbot)..."

# Create a letsencrypt certificate
./certbot-auto certonly \
    --non-interactive \
    --email sebastianbengtegard@gmail.com \
    --agree-tos \
    --webroot \
    -t \
    -w ./sites/livingarchives \
        -d livingarchives.org \
        -d www.livingarchives.org \
    -w ./sites/skybox \
        -d skybox.livingarchives.org \
    -w ./node \
        -d alberta.livingarchives.org \
        -d api.livingarchives.org

echo "Restarting docker-compose..."
docker-compose restart

echo "Switch to HTTPS-only nginx configuration..."
docker-compose exec nginx switch-to-https-only

# echo "Cleanup..."
# rm ./certbot-auto
# rm ./certbot.log

echo "Done."

#
# TODO add saftey checks on commands
# 
# Return value of commands are 0 or 1, 0 = success
# if [ $? -eq 0 ]; then
#     echo OK
# else
#     echo FAIL
# fi
