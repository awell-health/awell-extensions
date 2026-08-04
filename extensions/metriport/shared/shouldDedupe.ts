/**
 * Whether duplicate webhook deliveries should be deduped via the rate limiter.
 *
 * We only dedupe in production: Metriport sandbox testing always sends the same
 * data (and reuses the same `meta.messageId`), which would make the dedupe guard
 * a blocker for development.
 *
 * Lives in its own module so tests can mock it and exercise the rate-limiting
 * behaviour without mutating `process.env`.
 */
export const shouldDedupe = (): boolean =>
  process.env.AWELL_ENVIRONMENT?.includes('production') ?? false
