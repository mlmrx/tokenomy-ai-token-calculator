package main

import (
	"bytes"
	"testing"
)

func TestSampleLoop(t *testing.T) {
	data := `{"gpu_uuid":"abc","tokens_processed":100,"window_ns":1000000000}`
	r := bytes.NewBufferString(data)
	go sampleLoop(r)
	// allow sample loop to process
	// this is a simple test; in real use we'd have more robust checks
}
