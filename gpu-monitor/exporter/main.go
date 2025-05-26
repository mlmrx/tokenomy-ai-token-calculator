package main

import (
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// TokenSample represents incoming token count sample.
type TokenSample struct {
	GPUUUID         string `json:"gpu_uuid"`
	TokensProcessed int64  `json:"tokens_processed"`
	WindowNS        int64  `json:"window_ns"`
}

// InferenceSample from middleware token counters.
type InferenceSample struct {
	GPUUUID         string `json:"gpu_uuid"`
	TokensPrompt    int64  `json:"tokens_prompt"`
	TokensGenerated int64  `json:"tokens_generated"`
}

// Metrics for a single GPU.
type gpuMetrics struct {
	tokensTotal prometheus.Counter
	tps         prometheus.Gauge
	tps1m       prometheus.Gauge
	mu          sync.Mutex
	history     []float64
}

var (
	gpuMap   = map[string]*gpuMetrics{}
	registry = prometheus.NewRegistry()
)

func getMetrics(uuid string) *gpuMetrics {
	if m, ok := gpuMap[uuid]; ok {
		return m
	}
	m := &gpuMetrics{
		tokensTotal: prometheus.NewCounter(prometheus.CounterOpts{
			Name:        "tokens_total",
			ConstLabels: prometheus.Labels{"gpu": uuid},
		}),
		tps: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_tps",
			ConstLabels: prometheus.Labels{"gpu": uuid},
		}),
		tps1m: prometheus.NewGauge(prometheus.GaugeOpts{
			Name:        "gpu_tps_1m",
			ConstLabels: prometheus.Labels{"gpu": uuid},
		}),
		history: make([]float64, 0, 12),
	}
	registry.MustRegister(m.tokensTotal, m.tps, m.tps1m)
	gpuMap[uuid] = m
	return m
}

// sampleLoop reads json samples from r.
func sampleLoop(r io.Reader) {
	dec := json.NewDecoder(r)
	for {
		var ts TokenSample
		if err := dec.Decode(&ts); err != nil {
			if err == io.EOF {
				return
			}
			log.Printf("decode error: %v", err)
			continue
		}
		m := getMetrics(ts.GPUUUID)
		m.tokensTotal.Add(float64(ts.TokensProcessed))
		tps := float64(ts.TokensProcessed) / (float64(ts.WindowNS) / 1e9)
		m.mu.Lock()
		m.tps.Set(tps)
		m.history = append(m.history, tps)
		if len(m.history) > 12 {
			m.history = m.history[1:]
		}
		sum := 0.0
		for _, v := range m.history {
			sum += v
		}
		m.tps1m.Set(sum / float64(len(m.history)))
		m.mu.Unlock()
	}
}

func main() {
	addr := flag.String("listen", ":8080", "listen address")
	flag.Parse()
	go sampleLoop(os.Stdin)
	http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
	log.Printf("listening on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
