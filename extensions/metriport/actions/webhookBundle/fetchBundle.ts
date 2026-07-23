import axios from 'axios'
import { type Bundle } from '@medplum/fhirtypes'

/**
 * Downloads the FHIR bundle from a Metriport webhook payload URL. The URL is
 * pre-signed and only valid for 10 minutes.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const fetchBundle = async (url: string): Promise<Bundle> => {
  const { data } = await axios.get<Bundle>(url, {
    // The bundle can be large; give it room and expect JSON back.
    responseType: 'json',
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  return data
}
