import { type Setting, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import axios from 'axios'
import { isEmpty, isNil } from 'lodash'
import z from 'zod'
import { FieldSchema, fields } from './config/fields'
import { dataPoints } from './config/dataPoints'

const settings = {} satisfies Record<string, Setting>
const SettingSchema = z.unknown()

const PayloadSchema = z.object({
  fields: FieldSchema,
  settings: SettingSchema,
})

export const icd: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'icd',
  category: Category.DEMO,
  title: 'ICD-10 Code Lookup',
  description: 'Lookup ICD-10 codes and return the parent disease',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const {
      fields: { icd_codes },
    } = PayloadSchema.parse(payload)
    // if no codes, just return blank
    if (icd_codes.length === 0) {
      await onComplete({
        data_points: {
          codes: JSON.stringify([]),
          stringResponse: 'Blank',
        },
      })
      return
    }

    const accessToken = await grabAccessToken()

    const icdCodes = await grabICDCodes(accessToken, icd_codes)

    const resp = icdCodes.some(checkICDCode)

    await onComplete({
      data_points: {
        codes: JSON.stringify(icdCodes),
        stringResponse: resp ? 'TFU' : 'TCM',
      },
    })
  },
}

const ICDSchema = z
  .object({
    parent: z.array(z.string()),
    title: z.object({
      '@language': z.string(),
      '@value': z.string(),
    }),
  })
  .refine(({ parent }) => parent.length !== 0)
  .transform((data) => {
    return {
      parent: data.parent[0],
      title: data.title['@value'],
    }
  })
  .refine(({ parent }) => !isNil(parent) && !isEmpty(parent))
  .refine(({ title }) => !isNil(title) && !isEmpty(title))

interface LanguageResponse {
  '@language': string
  '@value': string
}

interface QueryResponse {
  '@context': string
  '@id': string
  parent: string[]
  child: string[]
  browserUrl: string
  code: string
  title: LanguageResponse
  inclusion: Array<{ label: LanguageResponse }>
  exclusion: Array<{ label: LanguageResponse }>
  classKind: string
}

const checkICDCode = (code: string): boolean => {
  const diseases = [
    'hypertension',
    'asthma',
    'diabetes mellitus',
    'heart failure',
    'copd',
  ]
  if (diseases.includes(code.toLowerCase())) {
    return true
  } else {
    return false
  }
}

const grabAccessToken = async (): Promise<string> => {
  const token_endpoint = 'https://icdaccessmanagement.who.int/connect/token'
  const client_id =
    'ee7ba0bd-5da7-4c9a-8623-6084fa92d8d0_7a6a5bb2-2dde-4a6b-b104-04aec6387536'
  const client_secret = 'Dz2n/CzI/EYFMKgqgBRZa0zZjkUUZYFEf8lh1EbAS4I='
  const scope = 'icdapi_access'
  const grant_type = 'client_credentials'

  // Prepare the data as URLSearchParams
  const params = new URLSearchParams()
  params.append('client_id', client_id)
  params.append('client_secret', client_secret)
  params.append('scope', scope)
  params.append('grant_type', grant_type)

  const token_response = await axios.post<{ access_token: string }>(
    token_endpoint,
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  const accessToken = token_response.data.access_token

  return accessToken
}

const grabICDCodes = async (
  accessToken: string,
  icd_codes: string[]
): Promise<string[]> => {
  /**
   * First Api call to get the parent of the ICD code, so E10 will return E10-E14
   * Second Api call to get the title of the parent, so E10-E14 will return Diabetes mellitus
   *
   */
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Accept-Language': 'en',
    'API-Version': 'v2',
  }
  const icdCodes = await Promise.all(
    icd_codes.map(async (code) => {
      const response = await axios.get<QueryResponse>(
        `https://id.who.int/icd/release/10/2019/${code}`,
        {
          headers,
        }
      )
      const { parent } = ICDSchema.parse(response.data)

      const parentUrl = parent.replace('http', 'https')

      const parentResponse = await axios.get<QueryResponse>(parentUrl, {
        headers,
      })
      
      const { title } = ICDSchema.parse(parentResponse.data)
      return title
    })
  )
  return icdCodes
}
