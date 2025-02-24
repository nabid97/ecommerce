import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }

  // Extended performance tracking
  const trackPerformance = () => {
    try {
      const performanceEntries = performance.getEntriesByType('navigation')[0];
      
      if (performanceEntries) {
        const metrics = {
          // Navigation timings
          loadTime: performanceEntries.loadEventEnd - performanceEntries.startTime,
          domInteractive: performanceEntries.domInteractive - performanceEntries.startTime,
          firstByte: performanceEntries.responseStart - performanceEntries.startTime,
          
          // Resource loading
          resourceCount: performance.getEntriesByType('resource').length,
          
          // Connection details
          connectionType: navigator.connection?.effectiveType || 'unknown'
        };

        // In production, you might want to send these metrics to a monitoring service
        if (process.env.NODE_ENV === 'production') {
          sendPerformanceMetrics(metrics);
        } else {
          console.log('Performance Metrics:', metrics);
        }
      }
    } catch (error) {
      console.error('Performance tracking error', error);
    }
  };

  // Send performance metrics to backend or monitoring service
  const sendPerformanceMetrics = (metrics) => {
    try {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        })
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to send performance metrics', error);
    }
  };

  // Track performance after page load
  if (document.readyState === 'complete') {
    trackPerformance();
  } else {
    window.addEventListener('load', trackPerformance);
  }
};

export default reportWebVitals;