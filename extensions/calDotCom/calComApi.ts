import { fetchTyped } from '@awell-health/extensions-core'
import { GetBookingResponseSchema, type Booking } from './schema'

class CalComApi {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.cal.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private constructUrl(url: string): string {
    return `${this.baseUrl}${url}?apiKey=${this.apiKey}`
  }

  async getBooking(id: string): Promise<Booking> {
    const url = this.constructUrl(`/bookings/${id}`)
    const response = await fetchTyped(url, GetBookingResponseSchema)
    return response.booking
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
    const response = await fetchTyped(url, GetBookingResponseSchema, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    })

    return response.booking
  }

  async deleteBooking(id: string): Promise<void> {
    const url = this.constructUrl(`/bookings/${id}/cancel`)
    await fetch(url, {
      method: 'DELETE',
    })
  }
}

export default CalComApi
