import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { sendEmail } from '..'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = {
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
      body: "<h1>Don't shout!</h1>",
      fromEmail: undefined,
      fromName: undefined,
    },
    settings: {
      apiKey: 'apiKey',
      fromName: 'fromName',
      fromEmail: 'from@test.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated(basePayload, onComplete, onError)

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
})
