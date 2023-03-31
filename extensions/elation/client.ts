import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
} from '../../lib/shared/client'
import { type Find } from './types/generic'
import { type CreateUpdatePatient, type Patient } from './types/patient'
import {
  type Subscription,
  type SubscriptionRequest,
} from './types/subscription'

export class ElationDataWrapper extends DataWrapper {
  public async getPatient(id: number): Promise<Patient> {
    const req = this.Request<Patient>({
      method: 'GET',
      url: `/patients/${id}`,
    })
    const res = await req
    return res
  }

  public async createPatient(
    obj: Partial<CreateUpdatePatient>
  ): Promise<Patient> {
    const req = this.Request<Patient>({
      method: 'POST',
      url: `/patients`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async updatePatient(
    id: number,
    obj: Partial<CreateUpdatePatient>
  ): Promise<Patient> {
    const req = this.Request<Patient>({
      method: 'PUT',
      url: `/patients/${id}`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async findSubscriptions(): Promise<Subscription[]> {
    const req = this.Request<Find<Subscription[]>>({
      method: 'GET',
      url: '/app/subscriptions/',
    })
    const res = await req
    return res.results
  }

  public async createSubscription(
    obj: SubscriptionRequest
  ): Promise<Subscription> {
    const req = this.Request<Subscription>({
      method: 'POST',
      url: '/app/subscriptions/',
      data: obj,
    })
    const res = await req
    return res
  }

  public async deleteSubscription(id: number): Promise<void> {
    const req = this.Request({
      method: 'DELETE',
      url: `/app/subscriptions/${id}/`,
    })
    await req
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

  public async createPatient(
    obj: Partial<CreateUpdatePatient>
  ): Promise<Patient> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(
    id: number,
    obj: Partial<CreateUpdatePatient>
  ): Promise<Patient> {
    return await this.FetchData(async (dw) => await dw.updatePatient(id, obj))
  }

  public async findSubscriptions(): Promise<Subscription[]> {
    return await this.FetchData(async (dw) => await dw.findSubscriptions())
  }

  public async createSubscription(
    obj: SubscriptionRequest
  ): Promise<Subscription> {
    return await this.FetchData(async (dw) => await dw.createSubscription(obj))
  }

  public async deleteSubscription(id: number): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.deleteSubscription(id)
    })
  }
}
