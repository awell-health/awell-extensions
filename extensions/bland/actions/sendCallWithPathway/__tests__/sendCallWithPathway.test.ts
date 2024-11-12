import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { sendCallWithPathway as action } from '../sendCallWithPathway'

jest.mock('../../../api/client', () => ({
  BlandApiClient: jest.fn().mockImplementation(() => ({
    sendCall: jest.fn().mockResolvedValue({
      data: {
        status: 'success',
        call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
      },
    }),
  })),
}))

const mockedSdk = jest.mocked(BlandApiClient)

describe('Bland.ai - Send call', () => {
  const {
    extensionAction: sendCallWithPathway,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await sendCallWithPathway.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          pathwayId: '123',
          requestData: JSON.stringify({
            name: 'John Doe',
          }),
          analysisSchema: JSON.stringify({
            name: 'string',
          }),
        },
        patient: {
          id: 'patient-id',
        },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
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

    expect(mockedSdk).toHaveBeenCalled()

    // Completion happens async via a Webhook from Bland
    expect(onComplete).not.toHaveBeenCalled()
    // expect(onComplete).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     data_points: expect.objectContaining({
    //       callId: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
    //       status: 'success',
    //     }),
    //     events: expect.arrayContaining([
    //       expect.objectContaining({
    //         date: expect.any(String),
    //         text: {
    //           en: 'Call sent to Bland. Status: success, Call ID: 9d404c1b-6a23-4426-953a-a52c392ff8f1',
    //         },
    //       }),
    //     ]),
    //   })
    // )
  })
})
