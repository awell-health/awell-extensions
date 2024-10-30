import {
  mockedCustomerData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { createCustomer } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Create customer', () => {
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
      sendbirdId: mockedCustomerData.sendbirdId,
    },
    settings: {
      applicationId: 'applicationId',
      chatApiToken: 'chatApiToken',
      deskApiToken: 'deskApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createCustomer.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      SendbirdClientMockImplementation.deskApi.createCustomer
    ).toHaveBeenCalledWith({
      sendbirdId: basePayload.fields.sendbirdId,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { customerId: String(mockedCustomerData.id) },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
