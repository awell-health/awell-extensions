import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  GetFaxDocumentInputSchema,
  type GetFaxInputTypeWithoutCredentials,
  type GetFaxDocumentResponseType,
} from './schema'

export class WestFaxApiClient {
  private readonly client: AxiosInstance
  private readonly credentials: {
    Username: string
    Password: string
    ProductId: string
  }

  constructor({
    baseUrl,
    username,
    password,
    productId,
  }: {
    baseUrl: string
    username: string
    password: string
    productId: string
  }) {
    this.credentials = {
      Username: username,
      Password: password,
      ProductId: productId,
    }

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {},
    })
  }

  async testConnection(): Promise<AxiosResponse<Record<string, unknown>>> {
    const allData = {
      ...this.credentials,
      Cookies: false,
    }

    const formData = new URLSearchParams()
    Object.entries(allData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const response = await this.client.post<Record<string, unknown>>(
      `/Security_Authenticate/JSON`,
      formData,
    )

    return response
  }

  async getFaxDocument(
    input: GetFaxInputTypeWithoutCredentials,
  ): Promise<AxiosResponse<GetFaxDocumentResponseType>> {
    const allData = GetFaxDocumentInputSchema.parse({
      ...this.credentials,
      ...input,
    })

    const formData = new URLSearchParams()
    Object.entries(allData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    })

    const response = await this.client.post<GetFaxDocumentResponseType>(
      `/Fax_GetFaxDocuments/JSON`,
      formData,
    )

    return response
  }
}
