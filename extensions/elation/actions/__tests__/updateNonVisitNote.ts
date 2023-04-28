import { updateNonVisitNote } from '../updateNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Update non-visit note action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      input: {
        nonVisitNoteId: nonVisitNoteResponseExample.id,
        author: nonVisitNoteResponseExample.bullets[0].author,
        text: nonVisitNoteResponseExample.bullets[0].text,
        chartDate: nonVisitNoteResponseExample.chart_date,
        documentDate: nonVisitNoteResponseExample.document_date,
        patient: nonVisitNoteResponseExample.patient,
        practice: nonVisitNoteResponseExample.patient,
        tags:
          nonVisitNoteResponseExample.tags?.length !== 0
            ? nonVisitNoteResponseExample.tags?.join(',')
            : undefined,
      },
    },
    {
      input: {
        nonVisitNoteId: 1,
        author: 1,
        text: 'abc',
        chartDate: '2023-01-01',
        documentDate: '2023-01-01',
        patient: 101,
        practice: 102,
        tags: '1,',
      },
    },
    {
      input: {
        nonVisitNoteId: 1,
        author: undefined,
        text: undefined,
        chartDate: undefined,
        documentDate: undefined,
        patient: undefined,
        practice: undefined,
        tags: undefined,
      },
    },
  ] as Array<{
    input: {
      nonVisitNoteId: number
      author: number
      text: string
      chartDate: string
      documentDate: string
      patient: number
      practice: number
      tags: string
    }
  }>)(
    '$#. Should successfully update and execute onComplete when input is $input',
    async ({ input }) => {
      await updateNonVisitNote.onActivityCreated(
        {
          fields: {
            ...input,
          },
          settings,
        } as any,
        onComplete,
        onError
      )
      expect(onComplete).toHaveBeenCalled()
    }
  )
})
