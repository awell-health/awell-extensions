import { type AxiosResponse } from 'axios'
import { type FilteredSearchContactResponseType } from '../../../lib/api/schema/FilteredSearchContact.schema'

export const FilteredSearchContactResponseMock = {
  data: {
    contacts: [
      {
        partial: true,
        id: 1,
        job_title: 'CEO',
        lead_score: 49,
        email: 'jamessampleton@gmail.com',
        work_number: '(473)-160-8261',
        mobile_number: '1-926-555-9503',
        open_deals_amount: '0.0',
        display_name: 'James Sampleton (sample)',
        avatar:
          'https://lh3.googleusercontent.com/-DbQggdfJ2_w/Vi4cRujEXKI/AAAAAAAAABs/-Byl2CFY3lI/w140-h140-p/Image3.png',
        last_contacted_mode: 'email_outgoing',
        last_contacted: '2016-02-08T02:36:07-08:00',
        first_name: 'James',
        last_name: 'Sampleton (sample)',
        city: 'San Diego',
        country: 'USA',
        created_at: '2016-02-11T02:36:06-08:00',
        updated_at: '2016-02-10T02:36:07-08:00',
      },
    ],
    meta: {
      total: 1,
    },
  },
} satisfies Partial<AxiosResponse<FilteredSearchContactResponseType>>
