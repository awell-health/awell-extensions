import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type TrackPersonEventInputType,
  type TrackPersonEventResponseType,
} from './schema'

const TRACK_API_BASE_URL = 'https://track.customer.io'

export interface CustomerioTrackApiClientOptions {
  apiKey: string
  siteId: string
}

export class CustomerioTrackApiClient {
  private readonly client: AxiosInstance

  constructor(private readonly options: CustomerioTrackApiClientOptions) {
    this.client = axios.create({
      baseURL: TRACK_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${this.options.siteId}:${this.options.apiKey}`,
        ).toString('base64')}`,
      },
    })
  }

  async trackPersonEvent(
    input: TrackPersonEventInputType,
  ): Promise<AxiosResponse<TrackPersonEventResponseType>> {
    const response = await this.client.post<TrackPersonEventResponseType>(
      `/api/v2/entity`,
      input,
    )

    return response
  }
}
