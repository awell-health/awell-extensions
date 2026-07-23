import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { deleteMetadata } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Delete metadata', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteMetadata)

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
      metadataKey: 'test',
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
    await deleteMetadata.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.chatApi.deleteMetadata,
    ).toHaveBeenCalledWith(
      basePayload.fields.userId,
      basePayload.fields.metadataKey,
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
