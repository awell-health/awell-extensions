import { TestHelpers } from '@awell-health/extensions-core'
import { callWithGrace } from './callWithGrace'
import { GridspaceClient } from '../../lib'
import { generateTestPayload } from '@/tests'

jest.mock('../../lib/client')
const mockCallWithGrace = jest
  .spyOn(GridspaceClient.prototype, 'callWithGrace')
  .mockImplementation(() => {
    return Promise.resolve({ success: true })
  })

describe('callWithGrace', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(callWithGrace)
  beforeEach(clearMocks)
  it('should call the GridspaceClient with the correct data', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          flowId: 'flowId',
          data: JSON.stringify({ first_name: 'John', last_name: 'Doe' }),
          phoneNumber: '1234567890',
        },
        settings: {
          accountId: 'someAccountId',
          clientSecret: 'someClientSecret',
        },
      }),
      onComplete,
      onError,
      helpers,
    })
    expect(mockCallWithGrace).toHaveBeenCalledWith('flowId', {
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
      patient_id: 'test-patient',
      pathway_id: 'pathway-id',
      activity_id: 'activity-id',
      pathway_definition_id: 'pathway-definition-id',
    })
  })
})
