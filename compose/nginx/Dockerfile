FROM nginx:1.10

# Add nginx configuration
COPY ./compose/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./compose/nginx/ssl-params.nginx /etc/nginx/ssl-params.nginx
COPY ./compose/nginx/servers.nginx /etc/nginx/servers.nginx
COPY ./compose/nginx/servers-prod.nginx /etc/nginx/servers-prod.nginx
COPY ./compose/nginx/upgrade-ssl.sh /usr/local/bin/upgrade-ssl
# Copy webroots
COPY ./sites/skybox /opt/sites/skybox/
COPY ./sites/livingarchives /opt/sites/livingarchives/

RUN chmod +x /usr/local/bin/upgrade-ssl

# Install curl for downloading the certbot
# Download certbot-auto and make it executable
RUN apt-get -qq update \
    && apt-get -qq -y install curl openssl \
    && curl https://dl.eff.org/certbot-auto > /usr/local/bin/certbot-auto \
    && chmod a+x /usr/local/bin/certbot-auto

RUN openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Create directory where we'll store our ssl keys/certificates
# Create the self signed certificate
RUN mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -newkey rsa:4086 \
    -subj "/C=XX/ST=XXXX/L=XXXX/O=XXXX/CN=localhost" \
    -keyout "/etc/nginx/ssl/key.pem" \
    -out "/etc/nginx/ssl/cert.pem" \
    -days 3650 -nodes -sha256
