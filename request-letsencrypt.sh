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
        -d alberta.livingarchives.org \
#     -w ./node/bitter-and-sweet \
#         -d bitterandsweet.livingarchives.org \
#     -w ./node/somatic-archiving \
#         -d somatic.livingarchives.org \

echo "Restarting docker-compose..."
docker-compose restart

echo "Switching to HTTPS-only nginx configuration..."
docker-compose exec nginx switch-to-https-only

echo "Done."

# TODO add saftey checks on commands
# 
# Return value of commands are 0 or 1, 0 = success
# if [ $? -eq 0 ]; then
#     echo OK
# else
#     echo FAIL
# fi
