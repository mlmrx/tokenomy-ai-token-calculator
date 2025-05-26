# GPU Monitor Exporter

This service consumes token sample data from stdin and exposes metrics in the Prometheus format.

```
cat samples.json | ./exporter --listen :8080
```

Metrics:
- `tokens_total{gpu="UUID"}`
- `gpu_tps{gpu="UUID"}` – instantaneous tokens per second
- `gpu_tps_1m{gpu="UUID"}` – 1 minute average TPS
