# Deployment Logging and Metrics

## Logging
The server uses [Pino](https://getpino.io/) for structured logging. Log levels are controlled via the `LOG_LEVEL` environment variable and include:

- `info` – general operational messages
- `warn` – unexpected situations that don't halt the process
- `error` – failures that need investigation

Each request log records the HTTP method, path, status code and response time.

## Metrics
Prometheus metrics are exposed through `express-prom-bundle` on the `/metrics` endpoint. These metrics include request durations and default Node.js process statistics for scraping by a Prometheus server.
