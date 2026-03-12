/**
 * Performance Optimization Utilities
 * Advanced localStorage caching, prefetching, and performance monitoring
 */

// ============================================
// LocalStorage Cache Manager
// ============================================

const STORAGE_PREFIX = "codedocs_";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface PerformanceData {
  pageViews: Record<string, number>;
  lastVisit: number;
  scrollPositions: Record<string, number>;
  expandedSections: string[];
  searchHistory: string[];
  prefersDark: boolean | null;
  prefersReducedMotion: boolean;
  visitCount: number;
  firstVisit: number;
}

class StorageManager {
  private prefix: string;
  private version: string;

  constructor(prefix = STORAGE_PREFIX, version = "1.0") {
    this.prefix = prefix;
    this.version = version;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private getStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
      }
    }
    return total;
  }

  private cleanupOldEntries(): void {
    const entries: Array<{ key: string; timestamp: number }> = [];

    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        try {
          const entry = JSON.parse(localStorage[key]) as CacheEntry<unknown>;
          if (entry.timestamp) {
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp (oldest first) and remove oldest 20%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      if (entry) {
        localStorage.removeItem(entry.key);
      }
    }
  }

  set<T>(key: string, data: T, ttl = CACHE_DURATION): boolean {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: this.version,
      };

      const serialized = JSON.stringify(entry);

      // Check storage limits
      if (this.getStorageSize() + serialized.length > MAX_STORAGE_SIZE) {
        this.cleanupOldEntries();
      }

      localStorage.setItem(this.getKey(key), serialized);
      return true;
    } catch (e) {
      // QuotaExceededError - cleanup and retry
      if (e instanceof Error && e.name === "QuotaExceededError") {
        this.cleanupOldEntries();
        try {
          localStorage.setItem(
            this.getKey(key),
            JSON.stringify({
              data,
              timestamp: Date.now(),
              ttl,
              version: this.version,
            }),
          );
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<T>;

      // Check version
      if (entry.version !== this.version) {
        this.remove(key);
        return null;
      }

      // Check TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  getStorageInfo(): { used: number; available: number; itemCount: number } {
    let itemCount = 0;
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        itemCount++;
      }
    }
    return {
      used: this.getStorageSize(),
      available: MAX_STORAGE_SIZE - this.getStorageSize(),
      itemCount,
    };
  }
}

// ============================================
// Performance Data Manager
// ============================================

class PerformanceManager {
  private storage: StorageManager;
  private data: PerformanceData;

  constructor() {
    this.storage = new StorageManager();
    this.data = this.loadData();
    this.trackVisit();
  }

  private getDefaultData(): PerformanceData {
    return {
      pageViews: {},
      lastVisit: Date.now(),
      scrollPositions: {},
      expandedSections: [],
      searchHistory: [],
      prefersDark: null,
      prefersReducedMotion: false,
      visitCount: 0,
      firstVisit: Date.now(),
    };
  }

  private loadData(): PerformanceData {
    const cached = this.storage.get<PerformanceData>("performance_data");
    return cached || this.getDefaultData();
  }

  private save(): void {
    this.storage.set("performance_data", this.data, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  private trackVisit(): void {
    this.data.visitCount++;
    this.data.lastVisit = Date.now();
    this.save();
  }

  // Track page views for prefetching
  trackPageView(path: string): void {
    this.data.pageViews[path] = (this.data.pageViews[path] || 0) + 1;
    this.save();
  }

  // Get most visited pages for smart prefetching
  getMostVisitedPages(limit = 10): string[] {
    return Object.entries(this.data.pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([path]) => path);
  }

  // Save scroll position for page
  saveScrollPosition(path: string, position: number): void {
    this.data.scrollPositions[path] = position;
    this.save();
  }

  // Get saved scroll position
  getScrollPosition(path: string): number {
    return this.data.scrollPositions[path] || 0;
  }

  // Track sidebar sections
  toggleSection(sectionId: string, expanded: boolean): void {
    const index = this.data.expandedSections.indexOf(sectionId);
    if (expanded && index === -1) {
      this.data.expandedSections.push(sectionId);
    } else if (!expanded && index !== -1) {
      this.data.expandedSections.splice(index, 1);
    }
    this.save();
  }

  getExpandedSections(): string[] {
    return this.data.expandedSections;
  }

  // Search history
  addSearchQuery(query: string): void {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;

    // Remove duplicates and add to front
    this.data.searchHistory = [
      trimmed,
      ...this.data.searchHistory.filter((q) => q !== trimmed),
    ].slice(0, 20); // Keep last 20 searches
    this.save();
  }

  getSearchHistory(): string[] {
    return this.data.searchHistory;
  }

  // Theme preference
  setThemePreference(prefersDark: boolean): void {
    this.data.prefersDark = prefersDark;
    this.save();
  }

  getThemePreference(): boolean | null {
    return this.data.prefersDark;
  }

  // Motion preference
  setMotionPreference(reduced: boolean): void {
    this.data.prefersReducedMotion = reduced;
    this.save();
  }

  getMotionPreference(): boolean {
    return this.data.prefersReducedMotion;
  }

  // Get user stats
  getStats(): {
    visitCount: number;
    daysSinceFirstVisit: number;
    uniquePagesVisited: number;
  } {
    return {
      visitCount: this.data.visitCount,
      daysSinceFirstVisit: Math.floor(
        (Date.now() - this.data.firstVisit) / (24 * 60 * 60 * 1000),
      ),
      uniquePagesVisited: Object.keys(this.data.pageViews).length,
    };
  }
}

// ============================================
// Prefetch Manager
// ============================================

class PrefetchManager {
  private prefetchedUrls = new Set<string>();
  private observer: IntersectionObserver | null = null;
  private performanceManager: PerformanceManager;

  constructor(perfManager: PerformanceManager) {
    this.performanceManager = perfManager;
    this.initIntersectionObserver();
    this.prefetchMostVisited();
  }

  private initIntersectionObserver(): void {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const link = entry.target as HTMLAnchorElement;
              this.prefetchUrl(link.href);
            }
          });
        },
        { rootMargin: "50px" },
      );
    }
  }

  observeLink(link: HTMLAnchorElement): void {
    if (this.observer && this.isEligibleForPrefetch(link.href)) {
      this.observer.observe(link);
    }
  }

  private isEligibleForPrefetch(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.origin === window.location.origin &&
        !this.prefetchedUrls.has(url) &&
        !url.includes("#") &&
        !url.match(/\.(pdf|zip|tar|gz|png|jpg|gif|svg)$/i)
      );
    } catch {
      return false;
    }
  }

  private prefetchUrl(url: string): void {
    if (this.prefetchedUrls.has(url)) return;

    // Use link prefetch
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "document";
    document.head.appendChild(link);

    this.prefetchedUrls.add(url);

    // Also tell service worker to prefetch
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "PREFETCH",
        urls: [url],
      });
    }
  }

  private prefetchMostVisited(): void {
    // Delay prefetching to not block initial load
    setTimeout(() => {
      const mostVisited = this.performanceManager.getMostVisitedPages(5);
      mostVisited.forEach((path) => {
        const url = new URL(path, window.location.origin).href;
        this.prefetchUrl(url);
      });
    }, 3000);
  }

  // Prefetch links in viewport
  prefetchVisibleLinks(): void {
    document.querySelectorAll("a[href]").forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        this.observeLink(link);
      }
    });
  }
}

// ============================================
// Resource Hints Manager
// ============================================

class ResourceHintsManager {
  private addedHints = new Set<string>();

  addPreconnect(origin: string): void {
    if (this.addedHints.has(`preconnect:${origin}`)) return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    this.addedHints.add(`preconnect:${origin}`);
  }

  addDnsPrefetch(origin: string): void {
    if (this.addedHints.has(`dns:${origin}`)) return;

    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = origin;
    document.head.appendChild(link);

    this.addedHints.add(`dns:${origin}`);
  }

  addPreload(href: string, as: string, type?: string): void {
    if (this.addedHints.has(`preload:${href}`)) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (as === "font") link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    this.addedHints.add(`preload:${href}`);
  }

  addModulePreload(href: string): void {
    if (this.addedHints.has(`module:${href}`)) return;

    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = href;
    document.head.appendChild(link);

    this.addedHints.add(`module:${href}`);
  }
}

// ============================================
// Image Lazy Loading Enhancer
// ============================================

class ImageOptimizer {
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.initObserver();
  }

  private initObserver(): void {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
              }
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute("data-srcset");
              }
              img.classList.add("loaded");
              this.observer?.unobserve(img);
            }
          });
        },
        { rootMargin: "100px" },
      );
    }
  }

  observeImages(): void {
    document
      .querySelectorAll('img[data-src], img[loading="lazy"]')
      .forEach((img) => {
        this.observer?.observe(img);
      });
  }

  // Decode images off main thread
  async decodeImage(img: HTMLImageElement): Promise<void> {
    if ("decode" in img) {
      try {
        await img.decode();
      } catch {
        // Fallback: image will load normally
      }
    }
  }
}

// ============================================
// Code Block Cache
// ============================================

class CodeBlockCache {
  private storage: StorageManager;

  constructor() {
    this.storage = new StorageManager(STORAGE_PREFIX + "code_", "1.0");
  }

  // Cache highlighted code blocks
  cacheHighlightedCode(id: string, html: string): void {
    this.storage.set(id, html, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  getCachedCode(id: string): string | null {
    return this.storage.get(id);
  }

  // Generate hash for code content
  generateId(code: string, language: string): string {
    let hash = 0;
    const str = `${language}:${code}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `cb_${Math.abs(hash).toString(36)}`;
  }
}

// ============================================
// Initialize Everything
// ============================================

let perfManager: PerformanceManager;
let prefetchManager: PrefetchManager;
let resourceHints: ResourceHintsManager;
let imageOptimizer: ImageOptimizer;
let codeCache: CodeBlockCache;

export function initPerformanceOptimizations(): void {
  // Initialize managers
  perfManager = new PerformanceManager();
  prefetchManager = new PrefetchManager(perfManager);
  resourceHints = new ResourceHintsManager();
  imageOptimizer = new ImageOptimizer();
  codeCache = new CodeBlockCache();

  // Track current page
  perfManager.trackPageView(window.location.pathname);

  // Add common preconnects
  resourceHints.addPreconnect("https://fonts.googleapis.com");
  resourceHints.addPreconnect("https://fonts.gstatic.com");
  resourceHints.addDnsPrefetch("https://www.google-analytics.com");

  // Observe links for prefetching
  if (document.readyState === "complete") {
    prefetchManager.prefetchVisibleLinks();
    imageOptimizer.observeImages();
  } else {
    window.addEventListener("load", () => {
      prefetchManager.prefetchVisibleLinks();
      imageOptimizer.observeImages();
    });
  }

  // Restore scroll position
  const savedScroll = perfManager.getScrollPosition(window.location.pathname);
  if (savedScroll > 0) {
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScroll);
    });
  }

  // Save scroll position on unload
  window.addEventListener("beforeunload", () => {
    perfManager.saveScrollPosition(window.location.pathname, window.scrollY);
  });

  // Listen for theme changes
  const themeObserver = new MutationObserver(() => {
    const isDark = document.documentElement.dataset.theme === "dark";
    perfManager.setThemePreference(isDark);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Check for reduced motion preference
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  perfManager.setMotionPreference(motionQuery.matches);
  motionQuery.addEventListener("change", (e) => {
    perfManager.setMotionPreference(e.matches);
  });
}

// Export managers for use in components
export {
  StorageManager,
  PerformanceManager,
  PrefetchManager,
  ResourceHintsManager,
  ImageOptimizer,
  CodeBlockCache,
  perfManager,
  prefetchManager,
  resourceHints,
  imageOptimizer,
  codeCache,
};
