## Run with `docker run`

### With default port (8080)

```bash
docker run -p 8080:8080 dstack:latest
```
### With custom port (8081)
```bash
docker run -p 8081:8080 dstack:latest
```
### With custom port (8081) and custom credentials (DSTACK_USER/DSTACK_PASSWORD)
```bash
docker run -p 8081:8080 --env DSTACK_USER=foo --env DSTACK_PASSWORD=bar dstack:latest
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