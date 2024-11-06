import { createLead } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockCreateRecordResponse } from '../../api/__mocks__'

jest.mock('../../api/client')

describe('Salesforce - Create Lead', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a Lead', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        data: JSON.stringify({
          RecordTypeId: '0125w000000BRDxAAO',
          LeadSource: 'Website',
          Referral_Type__c: 'Online Search',
          LastName: 'Doe',
          Email: 'johndoe@example.com',
          Phone: '123-456-7890',
          Status: 'New',
        }),
      } as any,
      settings: mockSettings,
    })

    await createLead.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        createdLeadId: String(mockCreateRecordResponse.id),
      },
      events: expect.any(Array),
    })
  })
})
