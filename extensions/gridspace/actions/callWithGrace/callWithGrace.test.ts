import { TestHelpers } from '@awell-health/extensions-core'
import { callWithGrace } from './callWithGrace'
import { GridspaceClient } from '../../lib'
import { generateTestPayload } from '../../../../src/tests'

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
          data: { foo: 'bar', name: 'John Doe' } as any,
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
      foo: 'bar',
      phone_number: '1234567890',
      patient_id: 'test-patient',
      name: 'John Doe',
      pathway_id: 'pathway-id',
      activity_id: 'activity-id',
      pathway_definition_id: 'pathway-definition-id',
    })
  })
})
