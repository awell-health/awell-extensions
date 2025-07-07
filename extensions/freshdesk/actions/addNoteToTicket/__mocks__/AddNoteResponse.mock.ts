import { type AxiosResponse } from 'axios'
import { type AddNoteResponseType } from '../../../lib/api/schema/AddNote.schema'

export const AddNoteResponseMock = {
  data: {
    body_text: 'Hi tom, Still Angry',
    body: '<div>Hi tom, Still Angry</div>',
    id: 5,
    incoming: false,
    private: false,
    user_id: 1,
    support_email: null,
    ticket_id: 3,
    notified_to: ['tom@yourcompany.com'],
    attachments: [],
    created_at: '2015-08-24T13:49:37Z',
    updated_at: '2015-08-24T13:49:37Z',
  },
} satisfies Partial<AxiosResponse<AddNoteResponseType>>
