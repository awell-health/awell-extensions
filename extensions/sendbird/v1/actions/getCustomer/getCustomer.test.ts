import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedCustomerData,
  mockedDates,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { getCustomer } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Get customer', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getCustomer)

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
      customerId: mockedCustomerData.id,
    },
    settings: {
      applicationId: 'applicationId',
      chatApiToken: 'chatApiToken',
      deskApiToken: 'deskApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await getCustomer.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.deskApi.getCustomer,
    ).toHaveBeenCalledWith(basePayload.fields.customerId)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        sendbirdId: mockedCustomerData.sendbirdId,
        project: String(mockedCustomerData.project),
        channelType: mockedCustomerData.channelType,
        displayName: mockedCustomerData.displayName,
        createdAt: mockedDates.iso,
        customFields: JSON.stringify({
          [mockedCustomerData.customFields[0].key]:
            mockedCustomerData.customFields[0].value,
        }),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
