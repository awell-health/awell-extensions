import { hmac, reply, type Verify } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { METRIPORT_SIGNATURE_HEADER } from '../../shared/verifyWebhookSignature'

/**
 * Metriport signs every request, pings included, with an HMAC-SHA256 of the
 * raw body under the webhook key, hex-encoded in `x-metriport-signature`.
 * https://docs.metriport.com/medical-api/getting-started/webhooks#authentication
 *
 * Unlike the legacy `realtimeUpdate` webhook, an unset key does not disable
 * verification: `hmac` rejects every request until one is configured.
 */
const signature = hmac<typeof settings>({
  header: METRIPORT_SIGNATURE_HEADER,
  secret: (s) => s.webhookKey,
})

/**
 * Metriport verifies a new webhook URL with a ping and expects the random
 * sequence echoed back as `pong`. Answered here, after the signature check, so
 * a ping never reaches `getRecords` and nothing is recorded as an ingestion.
 * https://docs.metriport.com/medical-api/getting-started/webhooks#the-ping-message
 */
const pingOf = (rawBody: Buffer): string | undefined => {
  try {
    const body: unknown = JSON.parse(rawBody.toString())
    if (typeof body !== 'object' || body === null) return undefined
    const { ping, meta } = body as { ping?: unknown; meta?: { type?: unknown } }
    return meta?.type === 'ping' && typeof ping === 'string' ? ping : undefined
  } catch {
    return undefined
  }
}

export const verify: Verify<typeof settings> = async (ctx) => {
  await signature(ctx)

  const ping = pingOf(ctx.rawBody)
  if (ping !== undefined) {
    return reply({ status: 200, body: { pong: ping } })
  }
}
