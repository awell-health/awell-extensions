import { updateLead } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('Salesforce - Update Lead', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateLead)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should update a Lead', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        sObjectId: 'some-lead-id',
        data: JSON.stringify({
          RecordTypeId: '0125w000000BRDxAAO',
          LeadSource: 'Website',
          Referral_Type__c: 'Online Search',
          LastName: 'Doe',
          Email: 'johndoe@example.com',
          Phone: '123-456-7890',
          Status: 'New',
        }),
      },
      settings: mockSettings,
    })

    await updateLead.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
