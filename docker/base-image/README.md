## Run with `docker run`

### With default port (8080)

```bash
docker run -p 8080:8080 dstackai/dstack:latest-master
```

### With custom port (8081)
```bash
docker run -p 8081:8080 --env DSTACK_PORT=8081 dstackai/dstack:latest-master
```

### Map your existing .dstack data folder
```bash
docker run -p 8080:8080 -v ~/.dstack:/root/.dstack dstackai/dstack:latest-master
```

### With custom port (8081) and custom credentials (DSTACK_USER/DSTACK_PASSWORD)
```bash
docker run -p 8081:8080 --env DSTACK_PORT=8081 --env DSTACK_USER=foo --env DSTACK_PASSWORD=bar dstackai/dstack:latest-master
```

## Run with `docker-compose`

### With default parameters (as specified in .env file)

```bash
docker-compose up
```
### With custom parameters (to override values in .env file)

```bash
DSTACK_PORT=8081 DSTACK_USER=foo DSTACK_PASSWORD=bar docker-compose up
```