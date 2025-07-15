import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type GetLeadResponseType,
  type FilteredSearchLeadResponseType,
  type FilteredSearchLeadInputType,
  type FilteredSearchContactResponseType,
  type FilteredSearchContactInputType,
} from './schema'

export class FreshsalesApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Token token=${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async getLead(leadId: string): Promise<AxiosResponse<GetLeadResponseType>> {
    const response = await this.client.get<GetLeadResponseType>(
      `/leads/${leadId}`,
    )

    return response
  }

  async searchLeadByEmail(
    email: string,
  ): Promise<AxiosResponse<FilteredSearchLeadResponseType>> {
    const body = {
      filter_rule: [
        { attribute: 'lead_email.email', operator: 'equals', value: email },
      ],
    } satisfies FilteredSearchLeadInputType

    const response = await this.client.post<FilteredSearchLeadResponseType>(
      `/filtered_search/lead`,
      body,
    )

    return response
  }

  async searchContactByEmail(
    email: string,
  ): Promise<AxiosResponse<FilteredSearchContactResponseType>> {
    const body = {
      filter_rule: [
        { attribute: 'contact_email.email', operator: 'equals', value: email },
      ],
    } satisfies FilteredSearchContactInputType

    const response = await this.client.post<FilteredSearchContactResponseType>(
      `/filtered_search/contact`,
      body,
    )

    return response
  }
}
