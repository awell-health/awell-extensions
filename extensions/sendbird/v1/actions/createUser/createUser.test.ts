import {
  mockedUserData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { createUser } from '..'
import { generateTestPayload } from '@/tests'

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
    patient: {
      id: 'test-patient',
      profile: { first_name: 'first-name', last_name: 'last-name' },
    },
    fields: {
      userId: mockedUserData.user_id,
      nickname: mockedUserData.nickname,
      issueAccessToken: true,
      metadata: JSON.stringify(mockedUserData.metadata),
      profileUrl: '',
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
    await createUser.onActivityCreated!(basePayload, onComplete, onError)

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

  test('Should call the onComplete callback with nickname as first and last name', async () => {
    basePayload.fields.nickname = ''
    await createUser.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      SendbirdClientMockImplementation.chatApi.createUser
    ).toHaveBeenCalledWith({
      user_id: basePayload.fields.userId,
      nickname: `${basePayload.patient.profile?.first_name as string} ${
        basePayload.patient.profile?.last_name as string
      }`,
      issue_access_token: basePayload.fields.issueAccessToken,
      metadata: JSON.parse(basePayload.fields.metadata),
      profile_url: mockedUserData.profile_url,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { userId: basePayload.fields.userId },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError when nickname and first and last name in patient are missing', async () => {
    basePayload.fields.nickname = ''
    basePayload.patient = {
      ...basePayload.patient,
      profile: { first_name: undefined, last_name: undefined },
    }

    await createUser.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toBeCalledTimes(1)
  })

  test('Should call the onComplete callback when firstName is available but lastName and nickname is missing', async () => {
    basePayload.fields.nickname = ''
    basePayload.patient = {
      ...basePayload.patient,
      profile: { first_name: 'test', last_name: undefined },
    }

    await createUser.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { userId: basePayload.fields.userId },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback when lastName is available but firstName and nickname is missing', async () => {
    basePayload.fields.nickname = ''
    basePayload.patient = {
      ...basePayload.patient,
      profile: { first_name: undefined, last_name: 'test' },
    }

    await createUser.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { userId: basePayload.fields.userId },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
