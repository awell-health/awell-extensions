import { type AxiosResponse } from 'axios'
import { type UpdateTicketResponseType } from '../../../lib/api/schema/UpdateTicket.schema'

export const UpdateTicketResponseMock = {
  data: {
    cc_emails: [],
    fwd_emails: [],
    reply_cc_emails: [],
    description_text: 'Not given.',
    description: '<div>Not given.</div>',
    spam: false,
    email_config_id: null,
    fr_escalated: false,
    group_id: null,
    priority: 2,
    requester_id: 1,
    responder_id: null,
    source: 3,
    status: 3,
    subject: '',
    id: 20,
    type: null,
    to_emails: null,
    product_id: null,
    attachments: [],
    is_escalated: false,
    tags: [],
    created_at: '2015-08-24T11:56:51Z',
    updated_at: '2015-08-24T11:59:05Z',
    due_by: '2015-08-27T11:30:00Z',
    fr_due_by: '2015-08-25T11:30:00Z',
  },
} satisfies Partial<AxiosResponse<UpdateTicketResponseType>>
