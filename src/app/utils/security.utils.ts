import DOMPurify from 'dompurify';

export function sanitizeInput(value: string): string {
  return value
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* event handlers
    .trim();
}


export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  htmlFields: string[] = []
): T {
  const htmlSet = new Set(htmlFields);
  const out: Record<string, unknown> = { ...data };

  for (const [k, v] of Object.entries(out)) {
    if (typeof v !== 'string') continue;
    out[k] = htmlSet.has(k)
      ? DOMPurify.sanitize(v, { USE_PROFILES: { html: true } }).trim()
      : v.trim();
  }
  return out as T;
}
