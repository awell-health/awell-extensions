import axios, {
  type AxiosResponse,
  type AxiosInstance,
  AxiosHeaders,
} from 'axios'
import { type GetBookingInputType, type GetBookingResponseType } from './schema'
import { endsWith } from 'lodash'

export class CalV2ApiClient {
  private readonly client: AxiosInstance

  private readonly apiKey: string
  private readonly calApiVersion?: string

  constructor({
    baseUrl,
    apiKey,
    calApiVersion,
  }: {
    baseUrl: string
    apiKey: string
    calApiVersion: string
  }) {
    this.apiKey = apiKey
    this.calApiVersion = calApiVersion

    this.client = axios.create({
      baseURL: endsWith(baseUrl, '/') ? baseUrl : `${baseUrl}/`,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'cal-api-version': this.calApiVersion,
      }),
    })
  }

  async getBooking(
    input: GetBookingInputType,
  ): Promise<AxiosResponse<GetBookingResponseType>> {
    const url = new URL(
      `bookings/${input.bookingUid}`,
      this.client.defaults.baseURL,
    )

    const response = await this.client.get<GetBookingResponseType>(
      url.toString(),
    )

    return response
  }
}
