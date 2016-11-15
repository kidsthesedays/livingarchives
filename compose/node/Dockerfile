FROM node:6.8

# RUN groupadd -r node && useradd -r -g node node

RUN npm install -g pm2@2.0.18 yarn

# TODO only copy files that are needed
COPY node /opt/node/
COPY ./compose/node/entrypoint.sh /entrypoint.sh

# RUN chown -R node /opt/node \
#     && chmod +x /entrypoint.sh \
#     && chown node /entrypoint.sh

RUN chmod +x /entrypoint.sh

WORKDIR /opt/node

# TODO does this work? or does it rely on node_modules being copied already?
RUN yarn install

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000 3001

CMD ["pm2-docker", "process.yml"]
