import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
} from '../../lib/shared/client'
import { type Patient } from './types/patient'

export class ElationDataWrapper extends DataWrapper {
  public async getPatient(id: number): Promise<Patient> {
    const req = this.Request<Patient>({
      method: 'GET',
      url: `/patients/${id}`,
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
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }
}
