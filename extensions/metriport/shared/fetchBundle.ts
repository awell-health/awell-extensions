import axios from 'axios'
import { useAgent } from 'request-filtering-agent'
import { type Bundle } from '@medplum/fhirtypes'

/**
 * A bundle costs several times its size in memory while it is parsed,
 * rewritten and stored, and the extension server runs jobs side by side in a
 * pod with a heap of 768 MB. Past this a download fails with a clear error
 * instead of taking every job on the pod down with it.
 */
export const MAX_BUNDLE_BYTES = 100 * 1024 * 1024
export const FETCH_BUNDLE_TIMEOUT_MS = 60_000

/**
 * Downloads the FHIR bundle from a Metriport webhook payload URL. The URL is
 * pre-signed and only valid for 10 minutes.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const fetchBundle = async (url: string): Promise<Bundle> => {
  // The URL arrives in a webhook payload. The filtering agent refuses private, loopback and
  // reserved addresses -- after DNS resolution, so a hostname that resolves inward is caught too.
  // AIK_js_ssrf flags the call regardless of the agent.
  // nosemgrep: AIK_js_ssrf
  const { data } = await axios.get<Bundle>(url, {
    httpAgent: useAgent(url),
    httpsAgent: useAgent(url),
    // The bundle can be large; give it room, up to a limit, and expect JSON back.
    responseType: 'json',
    maxContentLength: MAX_BUNDLE_BYTES,
    maxBodyLength: Infinity,
    timeout: FETCH_BUNDLE_TIMEOUT_MS,
  })
  return data
}
