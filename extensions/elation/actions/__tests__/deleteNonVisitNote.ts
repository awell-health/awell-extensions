import { deleteNonVisitNote } from '../deleteNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc, mockClientReturn } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Delete non-visit note action', () => {
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

  test('Should complete successfully', async () => {
    await deleteNonVisitNote.onActivityCreated!(
      {
        fields: {
          nonVisitNoteId: nonVisitNoteResponseExample.id,
        },
        settings,
      } as any,
      onComplete,
      onError
    )

    expect(mockClientReturn.deleteNonVisitNote).toHaveBeenCalledWith(
      nonVisitNoteResponseExample.id
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
