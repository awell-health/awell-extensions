import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { cacheService } from './cacheService'
import { type TriggerFlowResponseType } from './schema'

export class TalkdeskAthenaDataWrapper extends DataWrapper {
  /** https://docs.talkdesk.com/reference/flows-api-ref **/
  public async triggerFlow({
    flowId,
    data,
  }: {
    flowId: string
    data: Record<string, string>
  }): Promise<TriggerFlowResponseType> {
    const result = await this.Request<TriggerFlowResponseType>({
      method: 'POST',
      url: `flows/${flowId}/interactions`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    })
    return result
  }
}

interface TalkdeskClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class TalkdeskAPIClient extends APIClient<TalkdeskAthenaDataWrapper> {
  readonly ctor: DataWrapperCtor<TalkdeskAthenaDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new TalkdeskAthenaDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: TalkdeskClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService,
        useHeaderInAuthorization: true,
      }),
    })
  }

  public async triggerFlow({
    flowId,
    data,
  }: {
    flowId: string
    data: Record<string, string>
  }): Promise<TriggerFlowResponseType> {
    return await this.FetchData(
      async (dw) => await dw.triggerFlow({ flowId, data })
    )
  }
}
