// Development performance optimizations
// This file helps improve Fast Refresh and build performance during development

// Reduce console noise in development
if (process.env.NODE_ENV === 'development') {
  // Suppress specific warnings that aren't actionable
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress specific Next.js warnings that are not critical
    if (
      typeof message === 'string' && 
      (
        message.includes('[Fast Refresh]') ||
        message.includes('Image with src') ||
        message.includes('overrideMethod')
      )
    ) {
      return;
    }
    
    originalWarn(...args);
  };
}

export {};
