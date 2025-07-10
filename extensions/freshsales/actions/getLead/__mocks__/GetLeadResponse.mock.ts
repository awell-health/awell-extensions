import { type AxiosResponse } from 'axios'
import { type GetLeadResponseType } from '../../../lib/api/schema/GetLead.schema'

export const GetLeadResponseMock = {
  data: {
    lead: {
      id: 1,
      job_title: 'Sales Manager',
      email: 'janesampleton@gmail.com',
      work_number: '(368) 493-2360',
      mobile_number: '1-926-652-9503',
      address: '604-5854 Beckford St.',
      city: 'Glendale',
      state: 'Arizona',
      zipcode: '100652',
      country: 'USA',
      time_zone: null,
      display_name: 'Jane Sampleton (sample)',
      avatar:
        'https://lh3.googleusercontent.com/-BomfmRA2WqA/Vi4cXSJzXPI/AAAAAAAAABg/LO4MyF96ZQ4/w140-h140-p/Image1.png',
      keyword: 'B2B Success',
      medium: 'Blog',
      last_seen: '2016-02-10T02:36:06-08:00',
      last_contacted: '2016-02-08T02:36:06-08:00',
      lead_score: 96,
      stage_updated_time: '2016-02-10T02:36:06-08:00',
      first_name: 'Jane',
      last_name: 'Sampleton (sample)',
      company: {
        id: 2000010568,
        name: 'Widgetz.io (sample)',
        address: '160-6802 Aliquet Rd.',
        city: 'New Haven',
        state: 'Connecticut',
        zipcode: '68089',
        country: 'United States',
        number_of_employees: null,
        annual_revenue: null,
        website: 'widgetz.io',
        phone: '503-615-3947',
        industry_type_id: 2492,
        business_type_id: 354,
      },
      deal: null,
      links: {
        conversations:
          '/leads/1/conversations?include=email_conversation_recipients%2Ctargetable%2Cphone_number%2Cphone_caller%2Cnote%2Cuser\u0026per_page=3',
        activities: '/leads/1/activities',
      },
      created_at: '2016-02-10T02:36:06-08:00',
      updated_at: '2016-02-10T02:36:06-08:00',
      facebook: null,
      twitter: 'https://twitter.com/janesampleton',
      linkedin: 'http://linkedin.com/pub/jane-sampleton/109/39/b0',
      is_deleted: false,
    },
    meta: null,
  },
} satisfies Partial<AxiosResponse<GetLeadResponseType>>
