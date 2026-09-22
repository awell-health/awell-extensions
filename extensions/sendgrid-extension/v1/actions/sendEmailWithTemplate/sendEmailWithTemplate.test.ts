import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email with template', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendEmailWithTemplate,
  )

  const payload = {
    fields: {
      to: 'recipient@test.com',
      subject: 'Test subject',
      templateId: 'template-1',
      dynamicTemplateData: JSON.stringify({ name: 'John Doe' }),
      fromEmail: undefined,
      fromName: undefined,
    },
    settings: {
      apiKey: 'apiKey',
      fromName: 'fromName',
      fromEmail: 'from@test.com',
    },
  }

  const basePayload = generateTestPayload(payload)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  // Studio fields are pasted, and a pasted template id brings its line break with it. SendGrid
  // rejects `d-…\n` as "not a valid GUID", which on 2026-09-22 was the single largest class of
  // failed activity in production: 26 failures in one care flow definition, and the same mistake
  // present in four action definitions across two definitions.
  test('Should trim surrounding whitespace from the template id', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        ...payload,
        fields: {
          ...payload.fields,
          templateId: 'd-d64bc0efc7c940c9b05ea75bb8a2da80\n',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'd-d64bc0efc7c940c9b05ea75bb8a2da80',
      }),
    )
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: basePayload.settings.fromEmail,
        name: basePayload.settings.fromName,
      },
      to: basePayload.fields.to,
      templateId: basePayload.fields.templateId,
      subject: basePayload.fields.subject,
      dynamicTemplateData: {
        name: 'John Doe',
        subject: basePayload.fields.subject,
      },
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
    await sendEmailWithTemplate.onEvent!({
      payload: {
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
      onError,
      helpers,
      attempt: 1,
    })
    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: {
          name: 'settings',
          email: 'settings@settings.com',
        },
      }),
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
      await sendEmailWithTemplate.onEvent!({
        payload: {
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
        onError,
        helpers,
        attempt: 1,
      })
      expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'fields',
            email: 'fields@fields.com',
          },
        }),
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    },
  )

  test('Should throw error when fields and settings are not provided', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: {
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
      onError,
      helpers,
      attempt: 1,
    })
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

  test('Should use the subject action field value when no subject is defined in template data', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...payload.fields,
          subject: 'Subject 1',
          dynamicTemplateData: JSON.stringify({}),
        },
        settings: payload.settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: basePayload.settings.fromEmail,
        name: basePayload.settings.fromName,
      },
      to: basePayload.fields.to,
      templateId: basePayload.fields.templateId,
      subject: 'Subject 1',
      dynamicTemplateData: {
        subject: 'Subject 1',
      },
      customArgs: {
        website: 'https://awell.health',
        awellPatientId: basePayload.patient.id,
        awellActivityId: basePayload.activity.id,
      },
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should use the subject value defined in template data when no subject is defined for the action field', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...payload.fields,
          subject: '',
          dynamicTemplateData: JSON.stringify({
            subject: 'Subject 2',
          }),
        },
        settings: payload.settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: basePayload.settings.fromEmail,
        name: basePayload.settings.fromName,
      },
      to: basePayload.fields.to,
      templateId: basePayload.fields.templateId,
      subject: 'Subject 2',
      dynamicTemplateData: {
        subject: 'Subject 2',
      },
      customArgs: {
        website: 'https://awell.health',
        awellPatientId: basePayload.patient.id,
        awellActivityId: basePayload.activity.id,
      },
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should use the subject value defined in template data when both subjects are defined', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...payload.fields,
          subject: 'Subject 1',
          dynamicTemplateData: JSON.stringify({
            subject: 'Subject 2',
          }),
        },
        settings: payload.settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: basePayload.settings.fromEmail,
        name: basePayload.settings.fromName,
      },
      to: basePayload.fields.to,
      templateId: basePayload.fields.templateId,
      subject: 'Subject 2',
      dynamicTemplateData: {
        subject: 'Subject 2',
      },
      customArgs: {
        website: 'https://awell.health',
        awellPatientId: basePayload.patient.id,
        awellActivityId: basePayload.activity.id,
      },
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
