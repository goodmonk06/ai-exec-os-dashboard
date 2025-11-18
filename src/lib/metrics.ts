import { logger } from "./logger";

export interface MetricLabels {
  [key: string]: string | number;
}

export interface CounterMetric {
  name: string;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

export interface GaugeMetric {
  name: string;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

export interface HistogramMetric {
  name: string;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

// In-memory storage for development
const metrics: {
  counters: Map<string, CounterMetric>;
  gauges: Map<string, GaugeMetric>;
  histograms: HistogramMetric[];
} = {
  counters: new Map(),
  gauges: new Map(),
  histograms: [],
};

class MetricsCollector {
  /**
   * Increment a counter metric
   */
  counter(name: string, value: number = 1, labels?: MetricLabels) {
    const key = this.getMetricKey(name, labels);
    const existing = metrics.counters.get(key);

    if (existing) {
      existing.value += value;
      existing.timestamp = new Date();
    } else {
      metrics.counters.set(key, {
        name,
        value,
        labels,
        timestamp: new Date(),
      });
    }

    logger.debug(`Counter: ${name}`, { value, labels });
  }

  /**
   * Set a gauge metric (current value)
   */
  gauge(name: string, value: number, labels?: MetricLabels) {
    const key = this.getMetricKey(name, labels);

    metrics.gauges.set(key, {
      name,
      value,
      labels,
      timestamp: new Date(),
    });

    logger.debug(`Gauge: ${name}`, { value, labels });
  }

  /**
   * Record a histogram value (for latency, size, etc.)
   */
  histogram(name: string, value: number, labels?: MetricLabels) {
    metrics.histograms.push({
      name,
      value,
      labels,
      timestamp: new Date(),
    });

    // Keep only last 10000 histogram entries
    if (metrics.histograms.length > 10000) {
      metrics.histograms = metrics.histograms.slice(-10000);
    }

    logger.debug(`Histogram: ${name}`, { value, labels });
  }

  /**
   * Record request duration
   */
  recordDuration(name: string, startTime: number, labels?: MetricLabels) {
    const duration = Date.now() - startTime;
    this.histogram(name, duration, labels);
    return duration;
  }

  /**
   * Get all metrics (for reporting/export)
   */
  getMetrics() {
    return {
      counters: Array.from(metrics.counters.values()),
      gauges: Array.from(metrics.gauges.values()),
      histograms: metrics.histograms,
    };
  }

  /**
   * Get summary statistics for a histogram metric
   */
  getHistogramStats(name: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const values = metrics.histograms
      .filter((m) => m.name === name)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (values.length === 0) return null;

    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = values[0];
    const max = values[values.length - 1];

    const p50 = this.percentile(values, 0.5);
    const p95 = this.percentile(values, 0.95);
    const p99 = this.percentile(values, 0.99);

    return { count, sum, avg, min, max, p50, p95, p99 };
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear() {
    metrics.counters.clear();
    metrics.gauges.clear();
    metrics.histograms = [];
  }

  private getMetricKey(name: string, labels?: MetricLabels): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    return `${name}{${labelStr}}`;
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil(sortedValues.length * p) - 1;
    return sortedValues[Math.max(0, index)];
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Common metric names (constants for consistency)
export const METRIC_NAMES = {
  // API Metrics
  API_REQUEST_COUNT: "api.request.count",
  API_REQUEST_DURATION: "api.request.duration",
  API_ERROR_COUNT: "api.error.count",

  // Database Metrics
  DB_QUERY_COUNT: "db.query.count",
  DB_QUERY_DURATION: "db.query.duration",
  DB_ERROR_COUNT: "db.error.count",

  // Job Metrics
  JOB_CREATED: "job.created",
  JOB_STARTED: "job.started",
  JOB_COMPLETED: "job.completed",
  JOB_FAILED: "job.failed",
  JOB_DURATION: "job.duration",

  // Agent Metrics
  AGENT_CREATED: "agent.created",
  AGENT_EXECUTION_COUNT: "agent.execution.count",
  AGENT_EXECUTION_DURATION: "agent.execution.duration",

  // Workflow Metrics
  WORKFLOW_CREATED: "workflow.created",
  WORKFLOW_TRIGGERED: "workflow.triggered",
  WORKFLOW_STEP_EXECUTED: "workflow.step.executed",

  // Notification Metrics
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_FAILED: "notification.failed",
} as const;
