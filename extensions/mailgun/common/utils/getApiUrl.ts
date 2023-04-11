import { lowerCase } from 'lodash'
import { type z } from 'zod'
import { type RegionValidationSchema } from '../../settings'

const EU_REGION_API_URL = 'https://api.eu.mailgun.net/'
const US_REGION_API_URL = 'https://api.mailgun.net/'

export const getApiUrl = ({
  region,
}: {
  region: z.output<typeof RegionValidationSchema>
}): string => {
  const serializedRegion = lowerCase(region)

  if (serializedRegion === 'eu') {
    return EU_REGION_API_URL
  }

  return US_REGION_API_URL
}
