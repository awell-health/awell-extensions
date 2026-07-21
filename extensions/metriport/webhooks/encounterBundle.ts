import axios from 'axios'
import { type Encounter } from '@medplum/fhirtypes'
import { type EncounterBundle } from './types'

/**
 * Downloads the FHIR Encounter Bundle from the pre-signed `url` provided on the
 * notification payload. The link is only valid for 10 minutes, so this must be
 * called while handling the webhook.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const fetchEncounterBundle = async (
  url: string,
): Promise<EncounterBundle> => {
  const { data } = await axios.get<EncounterBundle>(url, {
    // The bundle can be large; give it room and expect JSON back.
    responseType: 'json',
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  return data
}

/**
 * Returns the first Encounter resource found in the bundle, if any.
 */
export const getEncounterFromBundle = (
  bundle: EncounterBundle,
): Encounter | undefined => {
  return bundle.entry
    ?.map((entry) => entry.resource)
    .find(
      (resource): resource is Encounter => resource?.resourceType === 'Encounter',
    )
}
