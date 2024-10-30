import {
  mockedCustomerData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { updateCustomerCustomFields } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe("Update customer's custom fields", () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      customerId: mockedCustomerData.id,
      customFields: JSON.stringify({
        email: 'test@test.com',
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
    await updateCustomerCustomFields.onActivityCreated!(
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
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
