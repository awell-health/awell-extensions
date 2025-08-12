import axios, { type AxiosInstance } from 'axios'

export class SrfaxApiClient {
  private readonly client: AxiosInstance
  private readonly baseUrl: string
  private readonly accountId: string
  private readonly password: string

  constructor({
    baseUrl,
    accountId,
    password,
  }: {
    baseUrl: string
    accountId: string
    password: string
  }) {
    this.baseUrl = baseUrl
    this.accountId = accountId
    this.password = password
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    })
  }

  async retrieveFax({
    faxDetailsId,
    direction,
  }: {
    faxDetailsId: string
    direction: 'IN' | 'OUT'
  }): Promise<{ status: string; result?: string; raw: unknown }> {
    const params = new URLSearchParams({
      action: 'Retrieve_Fax',
      access_id: this.accountId,
      access_pwd: this.password,
      sFaxDetailsID: faxDetailsId,
      sDirection: direction,
      sFaxFormat: 'PDF',
      sResponseFormat: 'JSON',
    })

    const { data } = await this.client.post('', params.toString())
    return { status: data?.Status, result: data?.Result, raw: data }
  }

  async getFaxInboxAll(): Promise<{ status: string; result?: any[]; raw: unknown }> {
    const params = new URLSearchParams({
      action: 'Get_Fax_Inbox',
      access_id: this.accountId,
      access_pwd: this.password,
      sPeriod: 'ALL',
      sResponseFormat: 'JSON',
    })

    const { data } = await this.client.post('', params.toString())
    return { status: data?.Status, result: data?.Result, raw: data }
  }
}
