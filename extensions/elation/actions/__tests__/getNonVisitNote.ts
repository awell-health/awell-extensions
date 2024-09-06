import { getNonVisitNote } from '../getNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc, mockClientReturn } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { type NonVisitNoteResponse } from '../../types/nonVisitNote'

jest.mock('../../client')

describe('Get non-visit note action', () => {
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
      response: nonVisitNoteResponseExample,
      dataPoints: {
        authorId: String(nonVisitNoteResponseExample.bullets[0].author),
        text: nonVisitNoteResponseExample.bullets[0].text,
        chartDate: nonVisitNoteResponseExample.chart_date,
        documentDate: nonVisitNoteResponseExample.document_date,
        patientId: String(nonVisitNoteResponseExample.patient),
        practiceId: String(nonVisitNoteResponseExample.practice),
        tags: undefined,
      },
    },
    {
      response: {
        ...nonVisitNoteResponseExample,
        practice: undefined,
        tags: [
          { id: 1, name: 'tag1' },
          { id: 2, name: 'tag2' },
        ],
      },
      dataPoints: {
        authorId: String(nonVisitNoteResponseExample.bullets[0].author),
        text: nonVisitNoteResponseExample.bullets[0].text,
        chartDate: nonVisitNoteResponseExample.chart_date,
        documentDate: nonVisitNoteResponseExample.document_date,
        patientId: String(nonVisitNoteResponseExample.patient),
        practiceId: undefined,
        tags: '1,2',
      },
    },
  ] as Array<{
    response: NonVisitNoteResponse
    dataPoints: {
      authorId?: string
      text?: string
      chartDate?: string
      documentDate?: string
      patientId?: string
      practiceId?: string
      tags?: string
    }
  }>)(
    '$#. Should execute onComplete with correct data point when response is $response',
    async ({ response, dataPoints }) => {
      mockClientReturn.getNonVisitNote.mockReturnValueOnce(response)
      await getNonVisitNote.onActivityCreated!(
        {
          fields: {
            nonVisitNoteId: 1,
          },
          settings,
        } as any,
        onComplete,
        onError
      )
      expect(onComplete).toHaveBeenCalledWith({
        data_points: dataPoints,
      })
    }
  )
})
