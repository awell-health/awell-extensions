import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { deleteUser } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Delete user', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteUser)

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
    await deleteUser.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.chatApi.deleteUser,
    ).toHaveBeenCalledWith(basePayload.fields.userId)
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
