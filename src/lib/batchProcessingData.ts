// Batch vs Real-time processing optimization data
export interface ProcessingScenario {
  id: string;
  name: string;
  description: string;
  avgInputTokens: number;
  avgOutputTokens: number;
  volumePerDay: number;
  latencyRequirement: string;
  currentApproach: "real-time" | "batch";
  recommendedApproach: "real-time" | "batch" | "hybrid";
  potentialSavings: number;
  reason: string;
}

export const batchingStrategies = [
  {
    name: "Smart Batching",
    description: "Combine multiple requests into single API call",
    savings: "40-60%",
    complexity: "Medium",
    bestFor: ["Classification", "Summarization", "Sentiment analysis"],
    implementation: "Aggregate requests over time window, process in bulk",
    considerations: ["Increased latency", "Batch size limits", "Error handling"]
  },
  {
    name: "Async Processing",
    description: "Queue non-urgent tasks for batch processing",
    savings: "30-50%",
    complexity: "Low",
    bestFor: ["Reports", "Analytics", "Content generation"],
    implementation: "Job queue system, scheduled batch runs",
    considerations: ["User expectations", "Queue management", "Failed job retries"]
  },
  {
    name: "Tiered Processing",
    description: "Real-time for urgent, batch for everything else",
    savings: "50-70%",
    complexity: "High",
    bestFor: ["Mixed workloads", "Enterprise systems"],
    implementation: "Priority queue, dynamic routing",
    considerations: ["Classification logic", "SLA management", "Monitoring"]
  },
  {
    name: "Off-Peak Processing",
    description: "Process during lower-cost time windows",
    savings: "20-40%",
    complexity: "Low",
    bestFor: ["Scheduled tasks", "Data processing", "Training"],
    implementation: "Time-based scheduling, rate limiting",
    considerations: ["Time zones", "Provider pricing", "User needs"]
  }
];

export const costComparison = {
  realTime: {
    name: "Real-time Processing",
    pros: [
      "Immediate results",
      "Better user experience",
      "Simple implementation",
      "No queuing infrastructure"
    ],
    cons: [
      "Higher API costs (no batching discount)",
      "More API calls = more overhead",
      "Rate limit pressure",
      "Inefficient for bulk operations"
    ]
  },
  batch: {
    name: "Batch Processing",
    pros: [
      "40-60% cost reduction via batching",
      "Efficient use of API calls",
      "Better rate limit management",
      "Optimized for throughput"
    ],
    cons: [
      "Added latency",
      "Queue management complexity",
      "Requires infrastructure",
      "Delayed feedback for users"
    ]
  }
};

export const batchSizeOptimization = [
  {
    batchSize: 1,
    overhead: "100%",
    throughput: "Low",
    costEfficiency: "Poor",
    recommendation: "Only for urgent, real-time needs"
  },
  {
    batchSize: 10,
    overhead: "30%",
    throughput: "Medium",
    costEfficiency: "Good",
    recommendation: "Good balance for most use cases"
  },
  {
    batchSize: 50,
    overhead: "15%",
    throughput: "High",
    costEfficiency: "Excellent",
    recommendation: "Ideal for high-volume, non-urgent tasks"
  },
  {
    batchSize: 100,
    overhead: "10%",
    throughput: "Very High",
    costEfficiency: "Excellent",
    recommendation: "Best for bulk processing, scheduled jobs"
  }
];
