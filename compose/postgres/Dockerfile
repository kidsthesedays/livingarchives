FROM postgres:9.5

# Dockerfile and shellscrips taken from cookiecutter-django

ENV TZ Europe/Stockholm

ADD backup.sh /usr/local/bin/backup
ADD restore.sh /usr/local/bin/restore
ADD list-backups.sh /usr/local/bin/list-backups

RUN chmod +x /usr/local/bin/backup
RUN chmod +x /usr/local/bin/restore
RUN chmod +x /usr/local/bin/list-backups

# Extra startup SQL files
COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d/
