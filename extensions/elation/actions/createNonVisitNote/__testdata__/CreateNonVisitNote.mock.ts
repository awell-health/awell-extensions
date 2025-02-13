import { type AxiosResponse } from 'axios'
import { type NonVisitNoteResponse } from 'extensions/elation/types'
import { type DeepPartial } from '../../../../../src/lib/types'

export const CreateNonVisitNoteMock = {
  status: 200,
  statusText: 'OK',
  data: {
    id: 1,
    type: 'nonvisit',
    bullets: [
      {
        id: 1,
        author: 1,
        category: 'Problem',
        text: 'Test',
        updated_date: '2023-01-01T00:00:00Z',
        version: 2,
      },
    ],
    patient: 1,
    practice: 1,
    chart_date: '2023-01-01T00:00:00Z',
    document_date: '2023-01-01T00:00:00Z',
    tags: [],
  },
} satisfies DeepPartial<AxiosResponse<NonVisitNoteResponse>>
