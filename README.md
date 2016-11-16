# Living Archives

Multiple projects (via Docker) for the Living Archives research project:

## Install

**Prerequisites:** 

* [Docker](https://www.docker.com/) 
* [Yarn](https://github.com/yarnpkg/yarn) (globally)

#### Step 1

Clone the git repository.

```
$ git clone https://github.com/livingarchives/livingarchives.git
$ cd livingarchives
```

#### Step 2

Install Node modules. This has to be done from the `node` directory.

```
$ cd node
$ yarn
```

#### Step 3

Create an environment file named `.env-node` containing the username, database name and password for [Postgres](https://www.postgresql.org/). The easiest way is copying the example file `.node-env.example` and then edit it with your text editor. This has to be done from the **root** directory.

```
$ cp .env-node.example .env-node
```

**Note:** don't forget to replace the example username, database name and password to your own.

#### Step 4

Build the Docker image via [docker-compose](https://docs.docker.com/compose/), the build process can take up to a couple of minutes. This has to be done from the **root** directory.

```
$ docker-compose build
```

#### Step 5

Add the following to the end of `/etc/hosts` to be able to visit the different projects locally.

```
127.0.0.1   livingarchives.org
127.0.0.1   skybox.livingarchives.org
127.0.0.1   alberta.livingarchives.org
127.0.0.1   api.livingarchives.org
```

**Note:** don't forget to remove these during production. 

#### Step 6

Start the Docker image. This has to be done from the **root** directory.

```
$ docker-compose up
```

**Note:** to run the process as a daemon `$ docker-compose up -d`

If everything worked you should now be able to visit `skybox.livingarchives.org` in your browser.

### Useful commands

Static typechecker 

```
$ cd node
$ yarn run flow
```

Watch for file changes via webpack

```
$ cd node
$ yarn run watch
```

#### Docker

Delete all containers

```
$ docker rm $(docker ps -a -q)
```

Delete all images

```
$ docker rmi $(docker images -q)
```

Delete postgres volumes

```
$ docker volume rm livingarchives_pgbackup
$ docker volume rm livingarchives_pgdata
```

Upgrade from self-signed SSL certificate to letsencrypt (CA)

```
$ docker-compose exec nginx upgrade-ssl
```

Create postgres backup

```
$ docker-compose exec postgres backup
```

List postgres backups

```
$ docker-compose exec postgres list-backups
```

Restore postgres backup

```
$ docker-compose exec postgres restore <filename>
```

## Contributing
