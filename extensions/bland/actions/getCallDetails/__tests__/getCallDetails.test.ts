import { TestHelpers } from '@awell-health/extensions-core'
import { z } from 'zod'
import { BlandApiClient } from '../../../api/client'
import { getCallDetails as action } from '../getCallDetails'

const callData = {
  call_id: 'd9cce3f3-23cf-4fa7-b62c-8be8119b8715',
  call_length: 0.75,
  batch_id: null,
  to: '+12223334444',
  from: '+17163511654',
  request_data: {
    phone_number: '+12223334444',
    wait: true,
    language: 'ENG',
  },
  completed: true,
  created_at: '2024-04-27T23:51:18.025251+00:00',
  inbound: false,
  queue_status: 'completed',
  endpoint_url: 'api.prod.bland.ai',
  max_duration: 30,
  error_message: null,
  variables: {
    now: 'Sat Apr 27 2024 18:51:25 GMT-0500 (Central Daylight Time)',
    now_utc: 'Sat, 27 Apr 2024 23:51:25 GMT',
    short_from: '7163511654',
    short_to: '2223334444',
    from: '+17163511654',
    to: '+12223334444',
    call_id: 'd9cce3f3-23cf-4fa7-b62c-8be8119b8715',
    phone_number: '+12223334444',
    city: 'SAN FRANCISCO',
    country: 'US',
    state: 'CA',
    zip: '12345',
    input: {
      date: '2024-04-28',
      rooms: 3,
    },
  },
  answered_by: 'human',
  record: false,
  recording_url: null,
  c_id: 'd9cce3f3-23cf-4fa7-b62c-8be8119b8715',
  metadata: {},
  summary:
    'The call was a conversation between a hotel booking service assistant and a customer. The customer expressed interest in booking a hotel room for tomorrow and needing three rooms. The assistant booked book the reservation for three rooms for the next day. Then, the call ended with the assistant thanking the customer for choosing their service.',
  price: 0.068,
  started_at: '2024-04-27T23:51:25+00:00',
  local_dialing: false,
  call_ended_by: 'ASSISTANT',
  pathway_logs: null,
  analysis_schema: null,
  analysis: {
    name: 'Nick',
  },
  concatenated_transcript:
    "user: Hello? \n assistant: Hi there! I'm calling from the hotel booking service. I'd love to help you with your reservation. Could you let me know what day you'd like to book your hotel for and how many rooms you'll need? \n user: Hopefully, tomorrow, I'm thinking. ...",
  transcripts: [
    {
      id: 7395694,
      created_at: '2024-04-27T23:51:28.568385+00:00',
      text: 'Hello?',
      user: 'user',
      c_id: 'd9cce3f3-23cf-4fa7-b62c-8be8119b8715',
      status: null,
      transcript_id: null,
    },
    {
      id: 7395698,
      created_at: '2024-04-27T23:51:30.689815+00:00',
      text: "Hi there! I'm calling from the hotel booking service. I'd love to help you with your reservation. Could you let me know what day you'd like to book your hotel for and how many rooms you'll need?",
      user: 'assistant',
      c_id: 'd9cce3f3-23cf-4fa7-b62c-8be8119b8715',
      status: null,
      transcript_id: 'c58ee235-0763-4ae1-a734-17fbba505c52',
    },
    //...
  ],
  status: 'completed',
  corrected_duration: '45',
  end_at: '2024-04-27T23:52:10.000Z',
}

jest.mock('../../../api/client', () => ({
  BlandApiClient: jest.fn().mockImplementation(() => ({
    getCallDetails: jest.fn().mockResolvedValue({
      data: callData,
    }),
  })),
}))

const mockedSdk = jest.mocked(BlandApiClient)

describe('Bland.ai - Get call details', () => {
  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          callId: 'call-id',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        callData: JSON.stringify(callData),
      },
      events: expect.any(Array),
    })
  })
})
