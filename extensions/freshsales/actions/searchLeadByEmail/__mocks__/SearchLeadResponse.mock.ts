import { type AxiosResponse } from 'axios'
import { type FilteredSearchLeadResponseType } from '../../../lib/api/schema/FilteredSearchLead.schema'

export const FilteredSearchLeadResponseMock = {
  data: {
    leads: [
      {
        id: 13025098470,
        job_title: null,
        lead_score: 3,
        last_contacted_mode: null,
        email: 'testing@joinbetter.com',
        emails: [
          {
            id: 13020775993,
            value: 'testing@joinbetter.com',
            is_primary: true,
            label: null,
            _destroy: false,
          },
        ],
        work_number: null,
        mobile_number: null,
        display_name: 'Test Test',
        avatar: null,
        company: null,
        last_contacted: null,
        stage_updated_time: '2024-01-10T16:49:17-05:00',
        first_name: 'Test',
        last_name: 'Test',
        city: 'Airway Heights',
        country: null,
        created_at: '2024-01-10T16:44:10-05:00',
        updated_at: '2024-05-29T17:53:44-04:00',
        recent_note: null,
        last_contacted_via_sales_activity: null,
        last_contacted_sales_activity_mode: null,
        web_form_ids: null,
        last_assigned_at: '2024-01-11T08:05:17-05:00',
        facebook: null,
        twitter: null,
        linkedin: null,
        record_type_id: '14001711357',
      },
    ],
    meta: {
      total: 1,
    },
  },
} satisfies Partial<AxiosResponse<FilteredSearchLeadResponseType>>
