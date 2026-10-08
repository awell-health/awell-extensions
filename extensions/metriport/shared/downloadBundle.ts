import axios from 'axios'
import { Transform, type Readable } from 'stream'
import { useAgent } from 'request-filtering-agent'
import { type ObjectStore } from '@awell-health/extensions-core'

/**
 * Past this a download fails with a clear error. Memory is not what this
 * bounds, as the body is never held; it is the time to read the bundle back and
 * the memory of its index, which grows with the number of resources.
 */
export const MAX_STORED_BUNDLE_BYTES = 250 * 1024 * 1024
/** A download that sends nothing for this long is dead. */
export const DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS = 60_000
/** A download that takes this long overall is stuck, however steadily it sends. */
export const DOWNLOAD_BUNDLE_DEADLINE_MS = 5 * 60_000

const TOO_LARGE = `The bundle is larger than the ${MAX_STORED_BUNDLE_BYTES} byte limit`

/** The `Content-Length` the source declared, if it declared a usable one. */
const declaredLength = (
  headers: Record<string, unknown> | undefined,
): number | undefined => {
  const value = Number(headers?.['content-length'])
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined
}

/** A body the client decoded: the length counts the bytes before decoding. */
const isContentEncoded = (headers: Record<string, unknown> | undefined): boolean => {
  const encoding = String(headers?.['content-encoding'] ?? '').trim().toLowerCase()
  return encoding !== '' && encoding !== 'identity'
}

/**
 * Passes bytes through and fails the stream once more than the limit has gone by,
 * or when nothing has come for `idleTimeoutMs`: the socket's own timeout is not
 * relied on to end a body that has started and then stopped.
 */
const limitBytes = (source: Readable, idleTimeoutMs: number): Readable => {
  let received = 0
  let idle: NodeJS.Timeout | undefined
  const watch = (): void => {
    if (idle !== undefined) clearTimeout(idle)
    idle = setTimeout(() => {
      limited.destroy(new Error(`The bundle download stopped sending for ${idleTimeoutMs} ms`))
    }, idleTimeoutMs)
    idle.unref()
  }
  const limited: Transform = new Transform({
    transform: (chunk: Buffer, _encoding, callback) => {
      watch()
      received += chunk.length
      if (received > MAX_STORED_BUNDLE_BYTES) callback(new Error(TOO_LARGE))
      else callback(null, chunk)
    },
  })
  source.once('error', (err) => limited.destroy(err))
  limited.once('close', () => {
    if (idle !== undefined) clearTimeout(idle)
    source.destroy()
  })
  watch()
  source.pipe(limited)
  return limited
}

/**
 * Downloads a Metriport bundle from its pre-signed URL straight into the object
 * store, without parsing it or holding it: a bundle can reach 100 MB, and
 * buffering it and then parsing it holds several times that. The URL is only
 * valid for 10 minutes, but it is checked when the request starts, so a
 * download that has begun is not cut off by it. What matters is to start at once.
 *
 * The stored size is checked against the `Content-Length` the source sent, so a
 * connection that ended early cannot leave a truncated bundle that the next step
 * would read as complete. A body that was content-encoded is not compared, as
 * its length counts the encoded bytes.
 *
 * The presigned URL is a credential and is never put in an error.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const downloadBundle = async ({
  url,
  name,
  objectStore,
  idleTimeoutMs = DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS,
}: {
  url: string
  /** The object name: the same name on a retry replaces what a failed attempt stored. */
  name: string
  objectStore: ObjectStore
  /** How long a body may send nothing for. */
  idleTimeoutMs?: number
}): Promise<{ ref: string; bytes: number }> => {
  // The URL arrives in a webhook payload. The filtering agent refuses private, loopback and
  // reserved addresses -- after DNS resolution, so a hostname that resolves inward is caught too.
  // AIK_js_ssrf flags the call regardless of the agent.
  // nosemgrep: AIK_js_ssrf
  const response = await axios.get<Readable>(url, {
    httpAgent: useAgent(url),
    httpsAgent: useAgent(url),
    responseType: 'stream',
    headers: { 'Accept-Encoding': 'identity' },
    timeout: DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS,
    signal: AbortSignal.timeout(DOWNLOAD_BUNDLE_DEADLINE_MS),
  })
  const body = response.data
  const declared = declaredLength(response.headers)

  if (declared !== undefined && declared > MAX_STORED_BUNDLE_BYTES) {
    body.destroy()
    throw new Error(TOO_LARGE)
  }

  const { ref, size } = await objectStore.putStream(name, limitBytes(body, idleTimeoutMs), {
    contentType: 'application/json',
  })

  if (
    declared !== undefined &&
    !isContentEncoded(response.headers) &&
    size !== declared
  ) {
    throw new Error(
      `The bundle is incomplete: stored ${size} bytes but the source's Content-Length was ${declared}`,
    )
  }

  return { ref, bytes: size }
}
