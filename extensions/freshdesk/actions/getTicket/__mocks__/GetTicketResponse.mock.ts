import { type AxiosResponse } from 'axios'
import { type GetTicketResponseType } from '../../../lib/api/schema/GetTicket.schema'

export const GetTicketResponseMock = {
  data: {
    cc_emails: ['user@cc.com'],
    fwd_emails: [],
    reply_cc_emails: ['user@cc.com'],
    email_config_id: null,
    fr_escalated: false,
    group_id: null,
    priority: 1, // Low
    requester_id: 1, // This is the ID of the Freshdesk contact the ticket is assigned to, we can then retrieve the contract which contains email and with that email we can retrieve Freshsales Lead
    responder_id: null,
    source: 2, // Portal
    spam: false,
    status: 2, // Open
    subject: '',
    company_id: 1,
    id: 20,
    type: null,
    to_emails: null,
    product_id: null,
    created_at: '2015-08-24T11:56:51Z',
    updated_at: '2015-08-24T11:59:05Z',
    due_by: '2015-08-27T11:30:00Z',
    fr_due_by: '2015-08-25T11:30:00Z',
    is_escalated: false,
    association_type: null,
    description_text: 'Not given.',
    description: '<div>Not given.</div>',
    custom_fields: {
      category: 'Primary',
    },
    tags: [],
    attachments: [],
  },
} satisfies Partial<AxiosResponse<GetTicketResponseType>>
