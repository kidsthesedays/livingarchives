FROM node:7.10

# Global install yarn package manager
RUN apt-get update && apt-get install -y curl apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

RUN yarn global add pm2@2.4.6

COPY ./node /opt/node/

COPY ./compose/node/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /opt/node/finding-alberta
RUN yarn install
WORKDIR /opt/node/bitter-and-sweet
RUN yarn install
WORKDIR /opt/node/somatic-archiving
RUN yarn install

WORKDIR /opt/node

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000-3003

CMD ["pm2-docker", "ecosystem.config.js"]
