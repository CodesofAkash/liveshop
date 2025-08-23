// Development performance optimizations
// This file helps improve Fast Refresh and build performance during development

// Environment variable validation utility
function validateEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
  ]

  const optionalVars = [
    'WEBHOOK_SECRET',
    'CLERK_WEBHOOK_SECRET',
  ]

  const missing: string[] = []
  const present: string[] = []

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  })

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName)
    }
  })

  return {
    missing,
    present,
    isValid: missing.length === 0
  }
}

function logEnvironmentStatus() {
  const status = validateEnvironmentVariables()
  
  
  if (status.missing.length > 0) {
  }
  
  if (!status.isValid) {
    console.warn('⚠️ Some required environment variables are missing!')
  }
}

// Reduce console noise in development
if (process.env.NODE_ENV === 'development') {
  // Log environment status
  logEnvironmentStatus()
  
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
