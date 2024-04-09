import {
  APIClient,
  DataWrapper,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
  type DataWrapperCtor,
} from '@awell-health/extensions-core'
import z from 'zod'
import { isEmpty, isNil } from 'lodash'

type ICDResponse = z.input<typeof ICDSchema>
type ICDOutput = z.output<typeof ICDSchema>

export class ICDDataWrapper extends DataWrapper {
  public async getCode(code: string): Promise<ICDOutput> {
    try {
      const req = this.Request<ICDResponse>({
        method: 'GET',
        url: `release/10/2019/${code}`,
        headers: {
          'Accept-Language': 'en',
          'API-Version': 'v2',
        },
      })
      const res = await req
      return ICDSchema.parse(res)
    } catch (e) {
      return {
        parent: 'Not Found',
        title: `${code} not found`,
      }
    }
  }
}

interface ICDAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'client_credentials'>
  baseUrl: string
  headers: Record<string, string>
}

export class ICDAPIClient extends APIClient<ICDDataWrapper> {
  readonly ctor: DataWrapperCtor<ICDDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new ICDDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: ICDAPIClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }

  public async getCode(code: string): Promise<ICDOutput> {
    return await this.FetchData(async (dw) => await dw.getCode(code))
  }
}

export const makeAPIClient = (): ICDAPIClient => {
  return new ICDAPIClient({
    authUrl: 'https://icdaccessmanagement.who.int/connect/token',
    requestConfig: {
      client_id:
        'ee7ba0bd-5da7-4c9a-8623-6084fa92d8d0_7a6a5bb2-2dde-4a6b-b104-04aec6387536',
      client_secret: 'Dz2n/CzI/EYFMKgqgBRZa0zZjkUUZYFEf8lh1EbAS4I=',
      scope: 'icdapi_access',
      grant_type: 'client_credentials',
    },
    baseUrl: 'https://id.who.int/icd/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
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
      parent: data.parent[0].split('/').pop(),
      title: data.title['@value'],
    }
  })
  .refine(({ parent }) => !isNil(parent) && !isEmpty(parent))
  .refine(({ title }) => !isNil(title) && !isEmpty(title))
