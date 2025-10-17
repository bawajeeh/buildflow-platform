// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
}

interface PerformanceConfig {
  enableMetrics: boolean
  enableLazyLoading: boolean
  enableCodeSplitting: boolean
  enableImageOptimization: boolean
}

class PerformanceService {
  private config: PerformanceConfig
  private metrics: PerformanceMetrics[] = []

  constructor(config: PerformanceConfig = {
    enableMetrics: true,
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableImageOptimization: true
  }) {
    this.config = config
  }

  // Measure page load time
  measureLoadTime(): number {
    if (typeof window === 'undefined') return 0
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation.loadEventEnd - navigation.loadEventStart
  }

  // Measure render time
  measureRenderTime(): number {
    if (typeof window === 'undefined') return 0
    
    const paint = performance.getEntriesByType('paint')
    const firstPaint = paint.find(entry => entry.name === 'first-paint')
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')
    
    return firstContentfulPaint ? firstContentfulPaint.startTime - (firstPaint?.startTime || 0) : 0
  }

  // Get memory usage
  getMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) return 0
    
    const memory = (performance as any).memory
    return memory.usedJSHeapSize / memory.totalJSHeapSize
  }

  // Get bundle size
  getBundleSize(): number {
    if (typeof window === 'undefined') return 0
    
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src && src.includes('assets')) {
        // This is a simplified calculation
        // In a real app, you'd fetch the actual file size
        totalSize += 100000 // Assume 100KB per script
      }
    })
    
    return totalSize
  }

  // Collect all metrics
  collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      loadTime: this.measureLoadTime(),
      renderTime: this.measureRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      bundleSize: this.getBundleSize()
    }

    if (this.config.enableMetrics) {
      this.metrics.push(metrics)
    }

    return metrics
  }

  // Get performance score
  getPerformanceScore(): number {
    const metrics = this.collectMetrics()
    
    // Simple scoring algorithm
    let score = 100
    
    if (metrics.loadTime > 3000) score -= 20
    if (metrics.renderTime > 1000) score -= 15
    if (metrics.memoryUsage > 0.8) score -= 10
    if (metrics.bundleSize > 1000000) score -= 15
    
    return Math.max(0, score)
  }

  // Optimize images
  optimizeImage(src: string, width?: number, height?: number): string {
    if (!this.config.enableImageOptimization) return src
    
    // Add optimization parameters
    const url = new URL(src, window.location.origin)
    
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    url.searchParams.set('q', '80') // Quality
    url.searchParams.set('f', 'webp') // Format
    
    return url.toString()
  }

  // Lazy load images
  lazyLoadImages(): void {
    if (!this.config.enableLazyLoading || typeof window === 'undefined') return
    
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      })
    })
    
    images.forEach(img => imageObserver.observe(img))
  }

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    if (typeof document === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }

  // Initialize performance monitoring
  init(): void {
    if (typeof window === 'undefined') return
    
    // Collect initial metrics
    this.collectMetrics()
    
    // Set up lazy loading
    if (this.config.enableLazyLoading) {
      this.lazyLoadImages()
    }
    
    // Monitor performance over time
    if (this.config.enableMetrics) {
      setInterval(() => {
        this.collectMetrics()
      }, 30000) // Every 30 seconds
    }
  }

  // Get metrics history
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
  }
}

// Create singleton instance
const performanceService = new PerformanceService()

export default performanceService
export { PerformanceService, type PerformanceMetrics, type PerformanceConfig }