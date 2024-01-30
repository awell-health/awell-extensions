import { postLetterResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { postLetter } from '../postLetter'

jest.mock('../../client')

describe('Post new letter action', () => {
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
    await postLetter.onActivityCreated(
      {
        fields: {
          patientId: postLetterResponseExample.patient,
          practiceId: postLetterResponseExample.practice,
          subject: postLetterResponseExample.subject,
          body: postLetterResponseExample.body,
          contactId: postLetterResponseExample.send_to_contact.id,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        letterId: String(postLetterResponseExample.id),
      },
    })
  })
})
