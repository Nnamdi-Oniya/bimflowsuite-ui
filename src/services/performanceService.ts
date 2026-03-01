// src/services/performanceService.ts
interface MetricData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: MetricData[] = [];
  private readonly thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[metric as keyof typeof this.thresholds];
    if (!threshold) return 'needs-improvement';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  trackMetric(name: string, value: number): void {
    const metric: MetricData = {
      name,
      value,
      rating: this.getRating(name, value),
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Send to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        metric_rating: metric.rating,
      });
    }

    // Log warnings for poor performance in development
    if (import.meta.env.DEV && metric.rating === 'poor') {
      console.warn(`Poor ${name}: ${value}ms`);
    }
  }

  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  getAverageMetrics(): Record<string, number> {
    const averages: Record<string, { sum: number; count: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!averages[metric.name]) {
        averages[metric.name] = { sum: 0, count: 0 };
      }
      averages[metric.name].sum += metric.value;
      averages[metric.name].count += 1;
    });

    const result: Record<string, number> = {};
    Object.keys(averages).forEach(key => {
      result[key] = averages[key].sum / averages[key].count;
    });

    return result;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}