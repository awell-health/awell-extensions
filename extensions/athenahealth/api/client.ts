import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
 type OAuthGrantClientCredentialsRequest } from '@awell-health/extensions-core'

export class AthenaDataWrapper extends DataWrapper {
  public async getPatient({
    practiceId,
    patientId,
  }: {
    practiceId: string
    patientId: string
  }): Promise<any> {
    return await this.Request<any>({
      method: 'GET',
      url: `/v1/${practiceId}/patients/${patientId}`,
    })
  }
}

interface AthenaClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class AthenaAPIClient extends APIClient<AthenaDataWrapper> {
  readonly ctor: DataWrapperCtor<AthenaDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new AthenaDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: AthenaClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }

  public async getPatient({
    practiceId,
    patientId,
  }: {
    practiceId: string
    patientId: string
  }): Promise<any> {
    /** FetchData returns a 404 */
    return await this.FetchData(
      async (dw) => await dw.getPatient({ patientId, practiceId })
    )
  }
}
