FROM node:6.8

RUN groupadd -r node && useradd -r -g node node

RUN npm install -g pm2@2.0.18
RUN npm install -g yarn

ADD node /opt/node/
ADD ./compose/node/entrypoint.sh /entrypoint.sh

RUN chown -R node /opt/node \
    && chmod +x /entrypoint.sh \
    && chown node /entrypoint.sh

WORKDIR /opt/node

RUN yarn install

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000 3001

CMD ["pm2-docker", "process.yml"]
