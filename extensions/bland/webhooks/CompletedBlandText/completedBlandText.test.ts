import { TestHelpers } from '@awell-health/extensions-core'
import { completedBlandText } from './completedBlandText'

describe('Bland.ai - Completed Bland Text webhook', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(completedBlandText)

  beforeEach(() => {
    clearMocks()
  })

  describe('when conversation_id is missing', () => {
    test('Should call onError and not call onSuccess', async () => {
      await extensionWebhook.onEvent({
        payload: {
          payload: { type: 'status', status: 'ended' },
          rawBody: Buffer.from(''),
          headers: {},
          settings: { apiKey: 'api-key' },
        } as any,
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({ statusCode: 400 }),
        }),
      )
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('when a valid SMS status payload is received', () => {
    test('Should map data points and resolve the patient from metadata', async () => {
      const payload = {
        type: 'status',
        conversation_id: 'b1c68c2b-e01a-4e0f-b21b-a064f2ef57b9',
        status: 'ended',
        channel: 'sms',
        phone_number: '+12223334444',
        agent_number: '+15556667777',
        conversation_history: [
          {
            sender: 'AGENT',
            message: 'Hi!',
            status: 'delivered',
            timestamp: '2026-07-22T15:17:24.149Z',
          },
          {
            sender: 'USER',
            message: 'Ok thanks',
            timestamp: '2026-07-22T15:17:46.742Z',
          },
        ],
        pathway_id: 'pathway-uuid',
        message_count: 2,
        ended_at: '2026-07-22T15:17:50.929Z',
        reason: 'Conversation ended at End Call or Transfer Call node',
        variables: {
          opted_out: false,
          patient_reply: 'Ok thanks',
          wants_to_schedule: true,
        },
        metadata: {
          awell_patient_id: 'patient-id',
          awell_activity_id: 'activity-id',
          awell_care_flow_id: 'care-flow-id',
          awell_care_flow_definition_id: 'definition-id',
        },
        concatenated_transcript: 'AGENT: Hi!\nUSER: Ok thanks',
      }

      await extensionWebhook.onEvent({
        payload: {
          payload,
          rawBody: Buffer.from(JSON.stringify(payload)),
          headers: {},
          settings: { apiKey: 'api-key' },
        } as any,
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          conversationId: 'b1c68c2b-e01a-4e0f-b21b-a064f2ef57b9',
          status: 'ended',
          reason: 'Conversation ended at End Call or Transfer Call node',
          userNumber: '+12223334444',
          agentNumber: '+15556667777',
          pathwayId: 'pathway-uuid',
          messageCount: '2',
          transcript: 'AGENT: Hi!\nUSER: Ok thanks',
          variables: JSON.stringify(payload.variables),
          conversationObject: JSON.stringify(payload),
        },
        patient_id: 'patient-id',
      })
    })
  })
})
