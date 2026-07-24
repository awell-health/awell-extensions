import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { updateMetadata } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Update metadata', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateMetadata)

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
      metadata: JSON.stringify(mockedUserData.metadata),
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
    await updateMetadata.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.chatApi.updateMetadata,
    ).toHaveBeenCalledWith(
      basePayload.fields.userId,
      JSON.parse(basePayload.fields.metadata),
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
