import {
  mockedCustomerData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { updateCustomerCustomFields } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../client')

describe("Update customer's custom fields", () => {
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
      customerId: mockedCustomerData.id,
      customFields: JSON.stringify({
        [mockedCustomerData.customFields[0].key]:
          mockedCustomerData.customFields[0].value,
      }),
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
    await updateCustomerCustomFields.onActivityCreated(
      basePayload,
      onComplete,
      onError
    )

    expect(
      SendbirdClientMockImplementation.deskApi.updateCustomerCustomFields
    ).toHaveBeenCalledWith(basePayload.fields.customerId, {
      customFields: JSON.stringify({
        [mockedCustomerData.customFields[0].key]:
          mockedCustomerData.customFields[0].value,
      }),
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
