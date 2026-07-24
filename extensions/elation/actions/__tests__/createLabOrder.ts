import { labOrderResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { createLabOrder } from '../createLabOrder'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('createLabOrder', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createLabOrder)
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return with correct data_points', async () => {
    await createLabOrder.onEvent!({
      payload: generateTestPayload({
        fields: {
          patientId: labOrderResponseExample.patient,
          practiceId: labOrderResponseExample.practice,
          documentDate: labOrderResponseExample.document_date,
          orderingPhysicianId: labOrderResponseExample.ordering_physician,
          vendorId: labOrderResponseExample.vendor,
          content: JSON.stringify(labOrderResponseExample.content),
          siteId: labOrderResponseExample.site,
          confidential: labOrderResponseExample.confidential,
        },
        settings,
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        labOrderId: String(labOrderResponseExample.id),
        printableLabOrderView: labOrderResponseExample.printable_view,
      },
    })
  })

  test('Should handle correctly when content is not correct', async () => {
    const onError = jest
      .fn()
      .mockImplementation((obj: { events: ActivityEvent[] }) => {
        return obj.events[0].error?.message
      })
    await createLabOrder.onEvent!({
      payload: generateTestPayload({
        fields: {
          patientId: labOrderResponseExample.patient,
          practiceId: labOrderResponseExample.practice,
          documentDate: labOrderResponseExample.document_date,
          orderingPhysicianId: labOrderResponseExample.ordering_physician,
          vendorId: labOrderResponseExample.vendor,
          content: JSON.stringify('not a valid content'),
          siteId: labOrderResponseExample.site,
          confidential: labOrderResponseExample.confidential,
        },
        settings,
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onError).toHaveBeenCalled()
    const errorMessage = onError.mock.calls[0][0].events[0].error?.message
    expect(errorMessage).toContain(
      'Validation error: The content field must conform to the Lab Order Content schema',
    )
  })
})
