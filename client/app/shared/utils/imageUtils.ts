/**
 * Optimizes Cloudinary image URLs by adding scale, format, and quality parameters.
 * E.g., translates:
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/img.jpg
 * into:
 *   https://res.cloudinary.com/<cloud>/image/upload/q_auto,f_auto,w_<width>,c_limit/v123/img.jpg
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, width: number = 800): string {
  if (!url) return "";
  
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/q_auto,f_auto,w_${width},c_limit/`);
  }
  
  return url;
}
