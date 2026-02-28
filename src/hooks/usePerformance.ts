// src/hooks/usePerformance.ts
import { useEffect, useCallback } from 'react';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  loadTime: number;
}

export const usePerformance = (reportToAnalytics = false) => {
  const reportMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.table(metrics);
    }
    
    // Report to your analytics service
    if (reportToAnalytics && window.gtag) {
      window.gtag('event', 'performance_metrics', metrics);
    }
  }, [reportToAnalytics]);

  useEffect(() => {
    // Check for PerformanceObserver support
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const metrics: Partial<PerformanceMetrics> = {};

    // Navigation Timing
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
      metrics.loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
    }

    // First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.FCP = entry.startTime;
          reportMetrics(metrics);
        }
      });
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.LCP = lastEntry.startTime;
      reportMetrics(metrics);
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const processingStart = (entry as PerformanceEventTiming).processingStart;
        const startTime = entry.startTime;
        metrics.FID = processingStart - startTime;
        reportMetrics(metrics);
      });
    });

    // Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsScore = 0;
      list.getEntries().forEach((entry) => {
        // Use type assertion with proper checking
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsScore += layoutShift.value || 0;
        }
      });
      metrics.CLS = clsScore;
      reportMetrics(metrics);
    });

    // Start observing
    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('PerformanceObserver error:', error);
    }

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [reportMetrics]);
};