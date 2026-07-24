import { deleteNonVisitNote } from '../deleteNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc, mockClientReturn } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Delete non-visit note action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteNonVisitNote)
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
    await deleteNonVisitNote.onEvent!({
      payload: generateTestPayload({
        fields: {
          nonVisitNoteId: nonVisitNoteResponseExample.id,
        },
        settings,
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockClientReturn.deleteNonVisitNote).toHaveBeenCalledWith(
      nonVisitNoteResponseExample.id,
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
