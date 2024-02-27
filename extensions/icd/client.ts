import { OAuthClientCredentials } from '@awell-health/extensions-core'
import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z from 'zod'

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

export class ICDDataWrapper extends DataWrapper {
  public async getICDCode({ code }: { code: string }): Promise<any> {
    const headers = {
      'Accept-Language': 'en',
      'API-Version': 'v2',
    }
    const data = await this.Request<any>({
      method: 'GET',
      url: `/${code}`,
      headers,
    })
    const { parent } = ICDSchema.parse(data)

    const parentCode = parent.split('/').pop() as string

    const parentResponse = await this.Request<any>({
      method: 'GET',
      url: `/${parentCode}`,
      headers,
    })

    const { title } = ICDSchema.parse(parentResponse)
    return title
  }
}

interface ICDClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

const props: ICDClientConstructorProps = {
  authUrl: 'https://icdaccessmanagement.who.int/connect/token',
  requestConfig: {
    client_id:
      'ee7ba0bd-5da7-4c9a-8623-6084fa92d8d0_7a6a5bb2-2dde-4a6b-b104-04aec6387536',
    client_secret: 'Dz2n/CzI/EYFMKgqgBRZa0zZjkUUZYFEf8lh1EbAS4I=',
    scope: 'icdapi_access',
  },
  baseUrl: 'https://id.who.int/icd/release/10/2019',
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
  }: ICDClientConstructorProps) {
    const auth = new OAuthClientCredentials({
      request_config: props.requestConfig,
      auth_url: props.authUrl,
    })
    super({ ...opts, auth })
  }

  public async getICDCode({ code }: { code: string }): Promise<any> {
    /** FetchData returns a 404 */
    return await this.FetchData(async (dw) => await dw.getICDCode({ code }))
  }
}
export const client = new ICDAPIClient(props)
