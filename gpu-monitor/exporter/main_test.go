package main

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/prometheus/client_golang/prometheus"
)

// TestSampleLoop feeds multiple TokenSample objects through sampleLoop
// and verifies the resulting Prometheus metrics.
func TestSampleLoop(t *testing.T) {
	// reset globals so tests are deterministic
	gpuMap = map[string]*gpuMetrics{}
	registry = prometheus.NewRegistry()

	samples := []TokenSample{
		{GPUUUID: "abc", TokensProcessed: 10, WindowNS: 1_000_000_000},
		{GPUUUID: "abc", TokensProcessed: 20, WindowNS: 1_000_000_000},
		{GPUUUID: "abc", TokensProcessed: 30, WindowNS: 1_000_000_000},
	}

	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	for _, s := range samples {
		if err := enc.Encode(s); err != nil {
			t.Fatalf("encode sample: %v", err)
		}
	}

	// run the loop synchronously so it finishes when EOF is reached
	sampleLoop(&buf)

	mfs, err := registry.Gather()
	if err != nil {
		t.Fatalf("gather metrics: %v", err)
	}

	var tokensTotal, tps, tps1m float64
	for _, mf := range mfs {
		switch mf.GetName() {
		case "tokens_total":
			if len(mf.Metric) != 1 {
				t.Fatalf("tokens_total expected 1 metric, got %d", len(mf.Metric))
			}
			tokensTotal = mf.Metric[0].GetCounter().GetValue()
		case "gpu_tps":
			if len(mf.Metric) != 1 {
				t.Fatalf("gpu_tps expected 1 metric, got %d", len(mf.Metric))
			}
			tps = mf.Metric[0].GetGauge().GetValue()
		case "gpu_tps_1m":
			if len(mf.Metric) != 1 {
				t.Fatalf("gpu_tps_1m expected 1 metric, got %d", len(mf.Metric))
			}
			tps1m = mf.Metric[0].GetGauge().GetValue()
		}
	}

	if tokensTotal != 60 {
		t.Errorf("tokens_total = %v, want 60", tokensTotal)
	}
	if tps != 30 {
		t.Errorf("gpu_tps = %v, want 30", tps)
	}
	if tps1m != 20 {
		t.Errorf("gpu_tps_1m = %v, want 20", tps1m)
	}
}
