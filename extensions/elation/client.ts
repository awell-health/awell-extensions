import {
  AuthType,
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
} from '../../lib/shared/client'
import { type Patient } from './types/patient'

/*
The idea behind creating an API client is that you define:
 - the data wrapper (which doesn't know about the auth)
 - the data wrapper constructor (which we pass to the API client)
 - the api client (which manages the authentication and full cycle)
*/

export class ElationDataWrapper extends DataWrapper {
  constructor(token: string, baseUrl: string) {
    super(AuthType.BEARER, token, baseUrl)
  }

  public async getPatient(id: number): Promise<Patient> {
    const req = this.Request<Patient>({
      method: 'GET',
      url: '/patients/:id',
      params: {
        id,
      },
    })
    const res = await req
    return res
  }
}

export const makeDataWrapper: DataWrapperCtor<ElationDataWrapper> = (
  token: string,
  baseUrl: string
) => new ElationDataWrapper(token, baseUrl)

export class ElationAPIClient extends APIClient<ElationDataWrapper> {
  public async getPatient(id: number): Promise<Patient> {
    return await this.fetchData(async (dw) => await dw.getPatient(id))
  }
}
