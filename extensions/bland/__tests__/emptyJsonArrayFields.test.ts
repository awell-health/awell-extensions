import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../api/client'
import { sendCall } from '../actions/sendCall/sendCall'
import { sendCallWithPathway } from '../actions/sendCallWithPathway'

const actions = [
  {
    name: 'sendCall',
    action: sendCall,
    baseFields: { phoneNumber: '+12133734253', task: 'Some task' },
  },
  {
    name: 'sendCallWithPathway',
    action: sendCallWithPathway,
    baseFields: { phoneNumber: '+12133734253', pathwayId: 'pathwayId' },
  },
]

const jsonArrayFields = ['tools', 'dynamic_data', 'pronunciation_guide']

// A cleared JSON field is saved as '' (or '[]' / '{}'); Bland rejects an empty `tools: []`.
describe.each(actions)(
  'Bland - $name empty JSON array fields',
  ({ action, baseFields }) => {
    let sendCallSpy: jest.SpyInstance
    const { extensionAction, onComplete, onError, helpers, clearMocks } =
      TestHelpers.fromAction(action)

    beforeEach(() => {
      clearMocks()
      jest.clearAllMocks()
      sendCallSpy = jest
        .spyOn(BlandApiClient.prototype, 'sendCall')
        .mockResolvedValue({
          data: {
            status: 'success',
            call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
          },
        } as any)
    })

    const run = async (fields: Record<string, string>): Promise<void> => {
      await extensionAction.onEvent({
        payload: {
          fields: { ...baseFields, ...fields },
          patient: { id: 'patient-id' },
          pathway: {
            id: 'pathway-id',
            definition_id: 'pathway-definition-id',
            tenant_id: '123',
          },
          activity: { id: 'activity-id' },
          settings: { apiKey: 'api-key' },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    }

    test.each(
      jsonArrayFields.flatMap((field) =>
        ['', '[]', '{}'].map((value) => [field, value]),
      ),
    )('does not send %s to Bland for %j', async (field, value) => {
      await run({ [field]: value })
      expect(onError).not.toHaveBeenCalled()
      // The key may be present as undefined; JSON serialisation drops it from the request body
      const body = JSON.parse(JSON.stringify(sendCallSpy.mock.calls[0][0]))
      expect(body).not.toHaveProperty(field)
    })

    test.each(jsonArrayFields)(
      'still sends a non-empty %s array',
      async (field) => {
        const value = [{ word: 'Awell', pronunciation: 'ah-well' }]
        await run({ [field]: JSON.stringify(value) })
        expect(sendCallSpy).toHaveBeenCalledWith(
          expect.objectContaining({ [field]: value }),
        )
      },
    )

    test.each(
      jsonArrayFields.flatMap((field) =>
        ['not json', '{"a":"b"}'].map((value) => [field, value]),
      ),
    )('errors without calling Bland for %s %j', async (field, value) => {
      await run({ [field]: value })
      expect(sendCallSpy).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
    })
  },
)
