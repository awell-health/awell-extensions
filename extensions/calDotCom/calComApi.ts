import fetch from 'node-fetch';

import { type Booking } from './types';


class CalComApi {
    private readonly apiKey: string
    private readonly baseUrl = 'https://api.cal.com/v1'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    private constructUrl(url: string): string { return `${this.baseUrl}${url}?apiKey=${this.apiKey}` }

    async getBooking(id: string): Promise<{ booking: Booking }> {
        const url = this.constructUrl(`/bookings/${id}`);

        const response = await fetch(url);
        if (!response.ok) throw Error(response.statusText)

        const data = await response.json();

        return data as { booking: Booking };
    }
}

export default CalComApi