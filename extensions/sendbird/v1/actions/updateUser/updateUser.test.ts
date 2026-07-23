import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { updateUser } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Update user', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateUser)

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
      nickname: 'Johnny2',
      issueAccessToken: undefined,
      profileUrl: undefined,
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
    await updateUser.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(
      SendbirdClientMockImplementation.chatApi.updateUser,
    ).toHaveBeenCalledWith({
      user_id: basePayload.fields.userId,
      nickname: 'Johnny2',
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
