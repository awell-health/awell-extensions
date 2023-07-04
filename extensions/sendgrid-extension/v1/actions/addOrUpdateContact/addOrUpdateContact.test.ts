import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { addOrUpdateContact } from '..'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Add or update contact', () => {
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
      listIds: 'a1,b2',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      customFields: '{"name":"John Doe"}',
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
    await addOrUpdateContact.onActivityCreated(basePayload, onComplete, onError)

    expect(
      SendgridClientMockImplementation.marketing.contacts.addOrUpdate
    ).toHaveBeenCalledWith({
      listIds: ['a1', 'b2'],
      contacts: [
        {
          email: basePayload.fields.email,
          first_name: 'John',
          last_name: 'Doe',
          custom_fields: { name: 'John Doe' },
        },
      ],
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
