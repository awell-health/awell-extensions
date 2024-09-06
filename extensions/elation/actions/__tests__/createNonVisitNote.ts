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
    await createNonVisitNote.onActivityCreated!(
      {
        fields: {
          patientId: nonVisitNoteResponseExample.patient,
          authorId: nonVisitNoteResponseExample.bullets[0].author,
          category: undefined,
          tags: undefined,
          text: nonVisitNoteResponseExample.bullets[0].text,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        nonVisitNoteId: String(nonVisitNoteResponseExample.id),
        nonVisitNoteBulletId: String(nonVisitNoteResponseExample.bullets[0].id),
      },
    })
  })
})
