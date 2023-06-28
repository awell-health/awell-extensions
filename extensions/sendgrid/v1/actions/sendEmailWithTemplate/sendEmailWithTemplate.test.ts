import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { sendEmailWithTemplate } from '..'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          to: 'recipient@test.com',
          subject: 'Test subject',
          templateId: 'template-1',
          dynamicTemplateData: JSON.stringify({ name: 'John Doe' }),
        },
        settings: {
          apiKey: 'apiKey',
          fromName: 'fromName',
          fromEmail: 'from@test.com',
        },
      },
      onComplete,
      onError
    )
    expect(SendgridClientMockImplementation.mail.send).toHaveBeenCalledWith({
      from: {
        email: 'from@test.com',
        name: 'fromName',
      },
      to: 'recipient@test.com',
      templateId: 'template-1',
      subject: 'Test subject',
      dynamicTemplateData: { name: 'John Doe', subject: 'Test subject' },
      customArgs: {
        website: 'https://awell.health',
        awellPatientId: 'test-patient',
        awellActivityId: 'activity-id',
      },
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
