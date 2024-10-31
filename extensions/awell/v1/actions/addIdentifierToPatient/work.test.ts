import { generateTestPayload } from '../../../../../tests'
import { addIdentifierToPatient } from './addIdentifierToPatient'
import { TestHelpers } from '@awell-health/extensions-core'
import { AwellSdk } from '@awell-health/awell-sdk'

describe('Add identifier to patient', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(addIdentifierToPatient)

  beforeEach(() => {
    clearMocks()
  })

  test('Should update the provided identifier system with the new identifier value', async () => {
    const sdk = new AwellSdk({
      environment: 'development',
      apiKey: 'az0XnXmB75kX9XfP9ZTyehtVIpXhqFQt',
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          // system: 'https://dock.health/',
          // value: 'dock-4',
          // system: 'https://athenahealth.com/',
          // value: 'athena',
          system: 'https://athenahealth.com/',
          value: 'athena-new',
        },
        settings: {},
        patient: {
          id: 'iCTFZF1HymuymjiLVq1y7',
        },
      }),
      onComplete,
      onError,
      helpers: {
        ...helpers,
        awellSdk: async () => sdk,
      },
    })

    expect(onComplete).toHaveBeenCalledWith({ hello: 'world' })
  })
})
