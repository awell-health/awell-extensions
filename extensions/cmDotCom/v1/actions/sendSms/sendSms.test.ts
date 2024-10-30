import { CmClientMockImplementation } from '../../../client/__mocks__'
import { sendSms } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../client')

describe('Send SMS', () => {
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
      fromName: 'fromName',
      recipient: '+123456789',
      message: 'message',
    },
    settings: {
      productToken: 'productToken',
      fromName: 'fromName',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated!(basePayload, onComplete, onError)

    expect(CmClientMockImplementation.sendSms).toHaveBeenCalledWith({
      from: basePayload.fields.fromName,
      to: basePayload.fields.recipient,
      message: basePayload.fields.message,
      reference: basePayload.activity.id,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test.each([{ value: undefined }, { value: '' }])(
    '$#. Should use settings values when fields equal "$value"',
    async ({ value }) => {
      await sendSms.onActivityCreated!(
        {
          ...basePayload,
          fields: {
            ...basePayload.fields,
            fromName: value,
          },
          settings: {
            ...basePayload.settings,
            fromName: 'settings',
          },
        },
        onComplete,
        onError
      )
      expect(CmClientMockImplementation.sendSms).toHaveBeenCalledWith({
        from: 'settings',
        to: basePayload.fields.recipient,
        message: basePayload.fields.message,
        reference: basePayload.activity.id,
      })
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    }
  )

  test.each([
    { settings: { fromName: undefined } },
    { settings: { fromName: '' } },
    { settings: { fromName: 'settings' } },
  ])(
    '$#. Should use fields values when provided and override settings values',
    async ({ settings }) => {
      await sendSms.onActivityCreated!(
        {
          ...basePayload,
          fields: {
            ...basePayload.fields,
            fromName: 'fields',
          },
          settings: {
            ...basePayload.settings,
            ...settings,
          },
        },
        onComplete,
        onError
      )
      expect(CmClientMockImplementation.sendSms).toHaveBeenCalledWith({
        from: 'fields',
        to: basePayload.fields.recipient,
        message: basePayload.fields.message,
        reference: basePayload.activity.id,
      })
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    }
  )

  test.each([{ value: undefined }, { value: '' }])(
    '$#. Should throw error when fields and settings are not provided',
    async ({ value }) => {
      await sendSms.onActivityCreated!(
        {
          ...basePayload,
          fields: {
            ...basePayload.fields,
            fromName: value,
          },
          settings: {
            ...basePayload.settings,
            fromName: value,
          },
        },
        onComplete,
        onError
      )
      expect(CmClientMockImplementation.sendSms).not.toHaveBeenCalled()
      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            error: {
              category: 'WRONG_INPUT',
              message:
                'Validation error: "fromName" is missing in both settings and in the action field.',
            },
          }),
        ],
      })
    }
  )
})
