FROM postgres:9.5

# Dockerfile and shellscrips taken from cookiecutter-django

ENV TZ Europe/Stockholm

COPY backup.sh /usr/local/bin/backup
COPY restore.sh /usr/local/bin/restore
COPY list-backups.sh /usr/local/bin/list-backups
COPY clear-statistics.sh /usr/local/bin/clear-statistics
COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d/

RUN chmod +x /usr/local/bin/backup \
    && chmod +x /usr/local/bin/restore \
    && chmod +x /usr/local/bin/clear-statistics \
    && chmod +x /usr/local/bin/list-backups

