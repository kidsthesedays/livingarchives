FROM nginx:1.13

# Add nginx configuration
COPY ./compose/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./compose/nginx/ssl-params.nginx /etc/nginx/ssl-params.nginx
COPY ./compose/nginx/servers.nginx /etc/nginx/servers.nginx
COPY ./compose/nginx/servers-prod.nginx /etc/nginx/servers-prod.nginx
COPY ./compose/nginx/switch-to-https-only.sh /usr/local/bin/switch-to-https-only

# Copy webroots
COPY ./sites/ /opt/sites/

RUN chmod +x /usr/local/bin/switch-to-https-only

# Install curl for downloading the certbot
# Download certbot-auto and make it executable
RUN apt-get -qq update && apt-get -qq -y install openssl --fix-missing

RUN openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Create directory where we'll store our ssl keys/certificates
# Create the self signed certificate
RUN mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -newkey rsa:4086 \
    -subj "/C=XX/ST=XXXX/L=XXXX/O=XXXX/CN=localhost" \
    -keyout "/etc/nginx/ssl/key.pem" \
    -out "/etc/nginx/ssl/cert.pem" \
    -days 3650 -nodes -sha256
