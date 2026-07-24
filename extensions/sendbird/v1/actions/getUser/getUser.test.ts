import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedDates,
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { getUser } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Get user', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getUser)

  const basePayload = generateTestPayload({
    pathway: {
      id: 'pathway-id',
      definition_id: 'pathway-definition-id',
    },
    activity: {
      id: 'activity-id',
    },
    patient: { id: 'test-patient' },
    fields: {
      userId: mockedUserData.user_id,
    },
    settings: {
      applicationId: 'applicationId',
      chatApiToken: 'chatApiToken',
      deskApiToken: 'deskApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await getUser.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.chatApi.getUser,
    ).toHaveBeenCalledWith(basePayload.fields.userId)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        nickname: mockedUserData.nickname,
        accessToken: mockedUserData.access_token,
        isActive: String(mockedUserData.is_active),
        createdAt: mockedDates.iso,
        lastSeenAt: mockedDates.iso,
        hasEverLoggedIn: String(mockedUserData.has_ever_logged_in),
        metadata: JSON.stringify(mockedUserData.metadata),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
