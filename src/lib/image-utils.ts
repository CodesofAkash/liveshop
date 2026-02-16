export const DEFAULT_PRODUCT_IMAGE = '/placeholder.png';

export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getImageWithFallback(url: string | undefined): string {
  if (!url) return DEFAULT_PRODUCT_IMAGE;
  if (!validateImageUrl(url)) return DEFAULT_PRODUCT_IMAGE;
  return url;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = DEFAULT_PRODUCT_IMAGE;
}