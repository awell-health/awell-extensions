import { TestHelpers } from '@awell-health/extensions-core'
import { observationCreated as webhook } from './ObservationCreated'
import { ObservationCreatedPayloadExample } from './__testdata__/payloadExample'
import { mockSettings } from '../../__mocks__'
import { MEDPLUM_IDENTIFIER } from '../../constants'

describe('Medplum - Webhook - Observation created', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload is invalid', () => {
    describe('When subject reference is missing', () => {
      test('Should call onError', async () => {
        await extensionWebhook.onEvent!({
          payload: {
            payload: {
              ...ObservationCreatedPayloadExample,
              subject: undefined,
            },
            settings: mockSettings,
            rawBody: Buffer.from(''),
            headers: {},
          },
          onSuccess,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          response: {
            statusCode: 400,
            message:
              'Missing patient subject reference in Observation payload. Only observations attached to a patient are processed.',
          },
        })
        expect(onSuccess).not.toHaveBeenCalled()
      })
    })

    describe('When subject reference is not a patient', () => {
      test('Should call onError', async () => {
        await extensionWebhook.onEvent!({
          payload: {
            payload: {
              ...ObservationCreatedPayloadExample,
              subject: {
                reference: 'Practitioner/f1fe291d-c035-47e3-aaec-613b794f5502',
              },
            },
            settings: mockSettings,
            rawBody: Buffer.from(''),
            headers: {},
          },
          onSuccess,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          response: {
            statusCode: 400,
            message:
              'Missing patient subject reference in Observation payload. Only observations attached to a patient are processed.',
          },
        })
        expect(onSuccess).not.toHaveBeenCalled()
      })
    })

    describe('When subject reference is empty', () => {
      test('Should call onError', async () => {
        await extensionWebhook.onEvent!({
          payload: {
            payload: {
              ...ObservationCreatedPayloadExample,
              subject: {},
            },
            settings: mockSettings,
            rawBody: Buffer.from(''),
            headers: {},
          },
          onSuccess,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          response: {
            statusCode: 400,
            message:
              'Missing patient subject reference in Observation payload. Only observations attached to a patient are processed.',
          },
        })
        expect(onSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('When payload is valid', () => {
    test('Should call onSuccess', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: ObservationCreatedPayloadExample,
          settings: mockSettings,
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          observation: JSON.stringify(ObservationCreatedPayloadExample),
          observationId: ObservationCreatedPayloadExample.id,
        },
        patient_identifier: {
          system: MEDPLUM_IDENTIFIER,
          value:
            ObservationCreatedPayloadExample.subject?.reference?.split('/')[1],
        },
      })
    })
  })
})
