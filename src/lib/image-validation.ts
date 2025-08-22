// Image validation utilities
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    
    // Check if it's actually an image
    if (!contentType?.startsWith('image/')) {
      return false;
    }
    
    // Check file size (e.g., max 5MB)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return false;
    }
    
    return response.ok;
  } catch {
    return false;
  }
}

export function isValidImageExtension(url: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  return validExtensions.some(ext => pathname.endsWith(ext));
}

export async function validateAndSanitizeImageUrl(url: string): Promise<{
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}> {
  try {
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Check for suspicious protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    // Validate extension
    if (!isValidImageExtension(url)) {
      return { isValid: false, error: 'Invalid image file extension' };
    }
    
    // Validate actual image content
    const isValidImage = await validateImageUrl(url);
    if (!isValidImage) {
      return { isValid: false, error: 'Unable to load image from URL' };
    }
    
    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}
