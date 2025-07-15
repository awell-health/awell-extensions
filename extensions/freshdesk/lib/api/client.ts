import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type UpdateTicketInputType,
  type UpdateTicketResponseType,
  type AddNoteInputType,
  type AddNoteResponseType,
  type GetTicketResponseType,
  type GetContactResponseType,
} from './schema'

export class FreshdeskApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    /**
     * Freshdesk uses Basic Auth with the API key as the username and a placeholder as the password.
     */
    const passwordPlaceholder = 'X'
    const token = Buffer.from(`${apiKey}:${passwordPlaceholder}`).toString(
      'base64',
    )

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async getContact(
    contactId: string,
  ): Promise<AxiosResponse<GetContactResponseType>> {
    const response = await this.client.get<GetContactResponseType>(
      `/contacts/${contactId}`,
    )

    return response
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
    const response = await this.client.put<UpdateTicketResponseType>(
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
