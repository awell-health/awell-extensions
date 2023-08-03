import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { createUser } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../client')

describe('Create user', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
      nickname: mockedUserData.nickname,
      issueAccessToken: true,
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
  })

  test('Should call the onComplete callback', async () => {
    await createUser.onActivityCreated(basePayload, onComplete, onError)

    expect(
      SendbirdClientMockImplementation.chatApi.createUser
    ).toHaveBeenCalledWith({
      user_id: basePayload.fields.userId,
      nickname: basePayload.fields.nickname,
      issue_access_token: basePayload.fields.issueAccessToken,
      metadata: JSON.parse(basePayload.fields.metadata),
      profile_url: mockedUserData.profile_url,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { userId: basePayload.fields.userId },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
