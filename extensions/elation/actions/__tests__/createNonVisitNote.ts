import { createNonVisitNote } from '../createNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Create non-visit note action', () => {
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

  test('Should return with correct data_points', async () => {
    await createNonVisitNote.onActivityCreated(
      {
        fields: {
          author: nonVisitNoteResponseExample.bullets[0].author,
          text: nonVisitNoteResponseExample.bullets[0].text,
          chartDate: nonVisitNoteResponseExample.chart_date,
          documentDate: nonVisitNoteResponseExample.document_date,
          patient: nonVisitNoteResponseExample.patient,
          practice: undefined,
          tags: undefined,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        nonVisitNoteId: String(nonVisitNoteResponseExample.id),
      },
    })
  })

  test.each([
    { input: '1' },
    { input: '1,2' },
    { input: '1,' },
    { input: '1,2, 3' },
    { input: '1,2, 3, 4 ,' },
    { input: undefined },
  ])(
    '$#. Should validate correctly when tags equal "$input"',
    async ({ input }) => {
      await createNonVisitNote.onActivityCreated(
        {
          fields: {
            author: nonVisitNoteResponseExample.bullets[0].author,
            text: nonVisitNoteResponseExample.bullets[0].text,
            chartDate: nonVisitNoteResponseExample.chart_date,
            documentDate: nonVisitNoteResponseExample.document_date,
            patient: nonVisitNoteResponseExample.patient,
            practice: undefined,
            tags: input,
          },
          settings,
        } as any,
        onComplete,
        onError
      )
      expect(onError).not.toHaveBeenCalled()
    }
  )
})
