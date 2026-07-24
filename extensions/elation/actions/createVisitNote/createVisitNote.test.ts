import { TestHelpers } from '@awell-health/extensions-core'

import { createVisitNote as action } from './createVisitNote'
import { createVisitNoteExample } from '../../__mocks__/constants'
import { testPayload } from '../../../../tests'

jest.mock('../../client')

describe('Elation - Create Visit Note', () => {
  const {
    extensionAction: createVisitNote,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should call onComplete when successful', async () => {
    await createVisitNote.onEvent({
      payload: {
        ...testPayload,
        fields: createVisitNoteExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        visitNoteId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when required fields are missing', async () => {
    await createVisitNote.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: 123,
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId has an invalid format', async () => {
    await createVisitNote.onEvent({
      payload: {
        ...testPayload,
        fields: {
          ...createVisitNoteExample,
          patientId: 'invalid',
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
