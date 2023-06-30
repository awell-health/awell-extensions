import { fetchTyped } from '@awell-health/extensions-core'
import { GetBookingResponseSchema, type Booking } from './types'

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
}

export default CalComApi
