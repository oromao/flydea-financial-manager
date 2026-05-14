// Real User Monitoring (RUM) - Captures actual user experience metrics
type VitalsMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
};

type WebVitalsData = {
  timestamp: number;
  url: string;
  metrics: {
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
    FCP?: number; // First Contentful Paint
    TTFB?: number; // Time to First Byte
  };
  userAgent: string;
  session: string;
};

class RealUserMonitoring {
  private sessionId: string;
  private metricsBuffer: WebVitalsData[] = [];
  private maxBufferSize = 50;
  private flushInterval = 30000; // 30 seconds
  private enabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.enabled = typeof window !== 'undefined' && !process.env.DISABLE_RUM;

    if (this.enabled) {
      this.initializeMonitoring();
    }
  }

  private generateSessionId(): string {
    if (typeof window === 'undefined') return '';
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.observeWebVitals();

    // Monitor API calls
    this.interceptFetch();

    // Monitor console errors
    this.monitorErrors();

    // Periodic flush
    setInterval(() => this.flushMetrics(), this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flushMetrics());
  }

  private observeWebVitals(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Observe Paint entries (FCP, LCP)
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            rating: 'good',
            delta: 0,
            id: `${entry.name}-${Date.now()}`
          });
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Browser doesn't support paint observer
    }

    // Observe Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        this.recordMetric({
          name: 'LCP',
          value,
          rating: this.getLCPRating(value),
          delta: 0,
          id: `lcp-${Date.now()}`
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support LCP observer
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          rating: this.getCLSRating(clsValue),
          delta: 0,
          id: `cls-${Date.now()}`
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Browser doesn't support CLS observer
    }

    // Navigation timing (TTFB, FCP)
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const ttfb = perfData.responseStart - perfData.fetchStart;
      const fcp = perfData.domInteractive - perfData.fetchStart;

      this.recordMetric({
        name: 'TTFB',
        value: ttfb,
        rating: ttfb < 600 ? 'good' : ttfb < 1200 ? 'needs-improvement' : 'poor',
        delta: 0,
        id: `ttfb-${Date.now()}`
      });

      this.recordMetric({
        name: 'FCP',
        value: fcp,
        rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor',
        delta: 0,
        id: `fcp-${Date.now()}`
      });
    });
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
  }

  private recordMetric(metric: VitalsMetric): void {
    console.debug(`[RUM] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    // In production, send to analytics service
  }

  private interceptFetch(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const [resource] = args;

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        const isAPI = typeof resource === 'string' && resource.includes('/api');
        if (isAPI) {
          console.debug(`[RUM] API ${response.status}: ${duration.toFixed(2)}ms`);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`[RUM] Fetch failed: ${resource} (${duration.toFixed(2)}ms)`, error);
        throw error;
      }
    };
  }

  private monitorErrors(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      console.error('[RUM] JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[RUM] Unhandled Promise Rejection:', event.reason);
    });
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // In production, send to analytics endpoint
    console.debug(`[RUM] Flushing ${metrics.length} metrics to analytics`);
  }

  public recordCustomMetric(name: string, value: number): void {
    this.recordMetric({
      name,
      value,
      rating: 'good',
      delta: 0,
      id: `${name}-${Date.now()}`
    });
  }

  public trackPageView(pageName: string): void {
    console.debug(`[RUM] Page View: ${pageName}`);
  }

  public trackUserAction(action: string, details?: Record<string, any>): void {
    console.debug(`[RUM] User Action: ${action}`, details);
  }
}

// Export singleton instance
export const rum = new RealUserMonitoring();

// Export for testing
export { RealUserMonitoring, type WebVitalsData };
