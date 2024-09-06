import {
  findContactResponseExample,
  postLetterResponseExample,
} from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { postLetter } from '../postLetter'
import { type ActivityEvent } from '@awell-health/extensions-core'

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
    await postLetter.onActivityCreated!(
      {
        fields: {
          patientId: postLetterResponseExample.patient,
          practiceId: postLetterResponseExample.practice,
          subject: postLetterResponseExample.subject,
          body: postLetterResponseExample.body,
          contactNpi: findContactResponseExample.results[0].npi,
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

  test('Should reject when both subject and referral order are not included', async () => {
    const onError = jest
      .fn()
      .mockImplementation((obj: { events: ActivityEvent[] }) => {
        return obj.events[0].error?.message
      })
    await postLetter.onActivityCreated!(
      {
        fields: {
          patientId: postLetterResponseExample.patient,
          practiceId: postLetterResponseExample.practice,
          body: postLetterResponseExample.body,
          contactNpi: findContactResponseExample.results[0].npi,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveReturnedWith(
      "Validation error: One of either 'subject' or 'referral order' is required."
    )
  })
})
