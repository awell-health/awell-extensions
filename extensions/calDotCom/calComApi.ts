import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, omitBy } from 'lodash'
import fetch from 'node-fetch'
import { GetBookingResponseSchema, type Booking } from './schema'

class CalComApi {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.cal.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private constructUrl(
    url: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const nonEmptyParams = omitBy(params, isNil)
    const queryParams = new URLSearchParams({
      apiKey: this.apiKey,
      ...nonEmptyParams,
    })

    return `${this.baseUrl}${url}?${queryParams.toString()}`
  }

  async getBooking(id: string): Promise<Booking> {
    const url = this.constructUrl(`/bookings/${id}`)
    const response = await fetchTyped(url, GetBookingResponseSchema)
    return response.booking
  }

  async createBooking(value: {
    eventTypeId: number
    start: string
    end?: string
    responses: {
      name: string
      email: string
      metadata: object
      location: string
    }
    metadata?: object
    timeZone: string
    language: string
    title?: string
    recurringEventId?: number
    status?: string
    description?: string
  }): Promise<Booking> {
    const response = await fetch('/bookings', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    })
    const result = await response.json()

    return result.booking
  }

  async updateBooking(
    id: string,
    value: {
      title?: string
      start?: string
      end?: string
      status?: string
      description?: string
    }
  ): Promise<Booking> {
    const url = this.constructUrl(`/bookings/${id}`)
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    })
    const result = await response.json()

    return result.booking
  }

  async deleteBooking(
    id: string,
    value: { allRemainingBookings?: boolean; cancellationReason?: string }
  ): Promise<void> {
    const url = this.constructUrl(`/bookings/${id}/cancel`, value)
    await fetch(url, {
      method: 'DELETE',
    })
  }
}

export default CalComApi
