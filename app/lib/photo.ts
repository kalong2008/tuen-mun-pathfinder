/**
 * Google Cloud Storage base URL for photo assets.
 * Photo paths in JSON are relative (e.g. "/photo/2011/2011-07-camp/2011-07-camp-1.jpeg").
 */
export const PHOTO_BASE_URL =
  "https://storage.googleapis.com/tuenmunpathfinder-storage";

/**
 * Returns the full photo URL. Accepts either a relative path (e.g. "/photo/2011/...")
 * or an already-absolute URL (returns unchanged).
 */
export function getPhotoUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl.slice(1) : pathOrUrl;
  return `${PHOTO_BASE_URL}/${path}`;
}
