# Living Archives

Multiple projects (via Docker) for the Living Archives research project:

## Install

**Prerequisite:** [Docker](https://www.docker.com/) has to be installed.

1. Clone the git repository.

```
$ git clone https://github.com/livingarchives/livingarchives.git
$ cd livingarchives
```

2. Install Node modules (via [yarn](https://github.com/yarnpkg/yarn) - this has to be globally installed on your own system). This has to be done from the `node` directory.

```
$ cd node
$ yarn
```

3. Create an environment file named `.env-node` containing the username, database name and password for [Postgres](https://www.postgresql.org/). The easiest way is copying the example file `.node-env.example` and then edit it with your text editor. This has to be done from the root directory.

```
$ cp .env-node.example .env-node
```

**Note:** don't forget to replace the example username, database name and password to your own.

4. Build the Docker image via [docker-compose](https://docs.docker.com/compose/). This has to be done from the root directory.

```
$ docker-compose build
```

5. Add the following to `/etc/hosts` to be able to visit the different projects locally.

```
# Add these to the end of /etc/hosts
127.0.0.1   livingarchives.dev
127.0.0.1   skybox.livingarchives.dev
127.0.0.1   alberta.livingarchives.dev
127.0.0.1   api.livingarchives.dev
```

6. Start the Docker image. This has to be done from the root directory.

```
$ docker-compose up
```

If everything worked you should now be able to visit `skybox.livingarchives.dev` in your browser.

## Contributing
