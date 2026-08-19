/**
 * Sanitizes a free-text value (e.g. a building name) for safe use as an S3 key path segment.
 * Spaces are collapsed to hyphens (not just stripped of disallowed chars) because raw spaces in
 * an S3 key are ambiguous across URL contexts — some encode them as `%20`, others as `+`, and a
 * `+` in a URL path is never decoded back to a space, causing the two to mismatch and 404.
 */
export const sanitizeS3PathSegment = (value: string): string =>
  value
    .trim()
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .trim() || 'unknown'
