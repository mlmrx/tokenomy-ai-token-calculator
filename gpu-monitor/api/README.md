# GPU Monitor API

A FastAPI service providing aggregated GPU throughput metrics from ClickHouse.

## Endpoints
- `GET /gpu/{uuid}/tps?range=1h`
- `GET /gpu/leaderboard?metric=tokens_total&limit=20`
