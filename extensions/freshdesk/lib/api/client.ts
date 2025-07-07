import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type UpdateTicketInputType,
  type UpdateTicketResponseType,
  type AddNoteInputType,
  type AddNoteResponseType,
  type GetTicketResponseType,
} from './schema'

export class FreshdeskApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    })
  }

  async getTicket(
    ticketId: string,
  ): Promise<AxiosResponse<GetTicketResponseType>> {
    const response = await this.client.get<GetTicketResponseType>(
      `/tickets/${ticketId}`,
    )

    return response
  }

  async updateTicket({
    ticketId,
    input,
  }: {
    ticketId: string
    input: UpdateTicketInputType
  }): Promise<AxiosResponse<UpdateTicketResponseType>> {
    const response = await this.client.post<UpdateTicketResponseType>(
      `/tickets/${ticketId}`,
      input,
    )

    return response
  }

  async addNote({
    ticketId,
    input,
  }: {
    ticketId: string
    input: AddNoteInputType
  }): Promise<AxiosResponse<AddNoteResponseType>> {
    const response = await this.client.post<AddNoteResponseType>(
      `/tickets/${ticketId}/notes`,
      input,
    )

    return response
  }
}
