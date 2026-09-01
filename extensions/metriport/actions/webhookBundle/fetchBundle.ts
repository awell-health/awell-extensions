import axios from 'axios'
import { useAgent } from 'request-filtering-agent'
import { type Bundle } from '@medplum/fhirtypes'

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
    // The bundle can be large; give it room and expect JSON back.
    responseType: 'json',
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  return data
}
