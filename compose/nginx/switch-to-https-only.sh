#!/bin/bash
set -e

echo "Swapping nginx configuration from development to production"
# Move configuration for development
mv /etc/nginx/servers.nginx /etc/nginx/servers-dev.nginx
# Move configuration for production
mv /etc/nginx/servers-prod.nginx /etc/nginx/servers.nginx

# Reload nginx
echo "Reloading nginx..."
nginx -s reload
