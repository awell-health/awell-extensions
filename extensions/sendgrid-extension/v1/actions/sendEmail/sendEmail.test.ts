import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      to: 'recipient@test.com',
      subject: 'Test subject',
      body: "<h1>Don't shout!</h1>",
      fromEmail: undefined,
      fromName: undefined,
    },
    settings: {
      apiKey: 'apiKey',
      fromName: 'fromName',
      fromEmail: 'from@test.com',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated!(basePayload, onComplete, onError)

    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: basePayload.settings.fromEmail,
        name: basePayload.settings.fromName,
      },
      to: basePayload.fields.to,
      subject: basePayload.fields.subject,
      html: basePayload.fields.body,
      customArgs: {
        website: 'https://awell.health',
        awellPatientId: basePayload.patient.id,
        awellActivityId: basePayload.activity.id,
      },
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should use settings values when fields are not provided', async () => {
    await sendEmail.onActivityCreated!(
      {
        ...basePayload,
        fields: {
          ...basePayload.fields,
          fromName: undefined,
          fromEmail: undefined,
        },
        settings: {
          ...basePayload.settings,
          fromName: 'settings',
          fromEmail: 'settings@settings.com',
        },
      },
      onComplete,
      onError
    )
    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: {
          name: 'settings',
          email: 'settings@settings.com',
        },
      })
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test.each([
    { settings: { fromName: undefined, fromEmail: undefined } },
    { settings: { fromName: 'settings', fromEmail: 'settings@settings.com' } },
  ])(
    '$#. Should use fields values when provided and override settings values',
    async ({ settings }) => {
      await sendEmail.onActivityCreated!(
        {
          ...basePayload,
          fields: {
            ...basePayload.fields,
            fromName: 'fields',
            fromEmail: 'fields@fields.com',
          },
          settings: {
            ...basePayload.settings,
            ...settings,
          },
        },
        onComplete,
        onError
      )
      expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'fields',
            email: 'fields@fields.com',
          },
        })
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    }
  )

  test('Should throw error when fields and settings are not provided', async () => {
    await sendEmail.onActivityCreated!(
      {
        ...basePayload,
        fields: {
          ...basePayload.fields,
          fromName: undefined,
          fromEmail: undefined,
        },
        settings: {
          ...basePayload.settings,
          fromName: undefined,
          fromEmail: undefined,
        },
      },
      onComplete,
      onError
    )
    expect(SendgridClientMockImplementation.mail.send).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message:
              'Validation error: "fromName" is missing in both settings and in the action field.; "fromEmail" is missing in both settings and in the action field.',
          },
        }),
      ],
    })
  })
})
