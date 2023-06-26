import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { sendEmail } from '..'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated(
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
          body: "<h1>Don't shout!</h1>",
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
      subject: 'Test subject',
      html: "<h1>Don't shout!</h1>",
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
