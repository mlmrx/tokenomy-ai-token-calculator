# GPU Token Throughput Monitor

This module provides a basic implementation of the GPU Token Throughput Monitor.
It consists of:

- **exporter/** – Go service that exposes Prometheus metrics from token samples
- **api/** – FastAPI service that queries ClickHouse for aggregated data
- **ui/** – React components for displaying GPU metrics
- **helm/** – Helm chart for deploying the services

The implementation is intentionally lightweight and intended as a starting point.
