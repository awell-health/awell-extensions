import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )
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
    await sendEmailWithTemplate.onActivityCreated!(
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
      await sendEmailWithTemplate.onActivityCreated!(
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
    await sendEmailWithTemplate.onActivityCreated!(
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

  test('Should use the subject action field value when no subject is defined in template data', async () => {
    await sendEmailWithTemplate.onActivityCreated!(
      generateTestPayload({
        fields: {
          ...payload.fields,
          subject: 'Subject 1',
          dynamicTemplateData: JSON.stringify({}),
        },
        settings: payload.settings,
      }),
      onComplete,
      onError
    )

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
    await sendEmailWithTemplate.onActivityCreated!(
      generateTestPayload({
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
      onError
    )

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
    await sendEmailWithTemplate.onActivityCreated!(
      generateTestPayload({
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
      onError
    )

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
