import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { sendCall as action } from '../sendCall'

const mockedSdk = jest.mocked(BlandApiClient)
const mockedCallResponse = async () => {
  return {
    data: {
      status: 'success',
      call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
    },
  } as any
}

describe('Bland.ai - Send call', () => {
  let sendCallSpy: jest.SpyInstance

  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    sendCallSpy = jest
      .spyOn(BlandApiClient.prototype, 'sendCall')
      .mockImplementation(mockedCallResponse)
  })

  test('Should work', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          task: 'Some task',
          requestData: JSON.stringify({
            name: 'John Doe',
          }),
          analysisSchema: JSON.stringify({
            name: 'string',
          }),
          otherData: JSON.stringify({
            foo: 'bar',
          }),
        },
        patient: {
          id: 'patient-id',
        },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
          tenant_id: '123',
        },
        activity: {
          id: 'activity-id',
        },
        settings: {
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(sendCallSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'bar',
      }),
    )

    // Completion happens async via a Webhook from Bland
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
        }),
        events: expect.any(Array),
      }),
    )
  })
})
