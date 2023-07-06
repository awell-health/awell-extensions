import { 
  WellinksSendgridClient, 
  WellinksSendgridClientMockImplementation
} from '../../__mocks__/wellinksSendgridClient';

import { unenrollFromSendgrid } from './unenrollFromSendgrid';

jest.mock('../../wellinksSendgridClient', () => ({ WellinksSendgridClient }))

describe('Unenroll from Sendgrid', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const emptyEmailPaylod = {
    pathway: {
      id: 'pathway-id',
      definition_id: 'pathway-definition-id'
    },
    activity: {
        id: 'activity-id'
    },
    patient: { id: 'test-patient' },
    fields: {
        email: '',
    },
    settings: {
        apiKey: 'apiKey',
        apiUrl: 'test-url',
        selectEventTypeQuestion: '',
        startSendingRemindersQuestions: '',
        memberEventFormId: '',
        sendgridApiKey: 'sendgridApiKey',
        sendgridApiUrl: 'sendgridApiUrl'
    },
  }

  const basicPayload = {
    pathway: {
      id: 'pathway-id',
      definition_id: 'pathway-definition-id'
    },
    activity: {
        id: 'activity-id'
    },
    patient: { id: 'test-patient' },
    fields: {
        email: 'example@example.com',
    },
    settings: {
        apiKey: 'apiKey',
        apiUrl: 'test-url',
        selectEventTypeQuestion: '',
        startSendingRemindersQuestions: '',
        memberEventFormId: '',
        sendgridApiKey: 'sendgridApiKey',
        sendgridApiUrl: 'sendgridApiUrl'
    },
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call onError if email is blank or nil', async () => {
    await unenrollFromSendgrid.onActivityCreated(emptyEmailPaylod, onComplete, onError)
    expect(onError).toHaveBeenCalled()
    // expect(WellinksSendgridClientMockImplementation.groups.addSuppression).to
  })

  test('Should call onComplete if the Sendgrid call finishes without error', async () => {
    await unenrollFromSendgrid.onActivityCreated(basicPayload, onComplete, onError)
    expect(WellinksSendgridClientMockImplementation.groups.addSuppression).toHaveBeenNthCalledWith(1, 
       '21827', 'example@example.com'
    )
    expect(WellinksSendgridClientMockImplementation.groups.addSuppression).toHaveBeenNthCalledWith(2, 
      '21848', 'example@example.com'
    )
    expect(onComplete).toBeCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
})