import { TestHelpers } from '@awell-health/extensions-core'
import { uploadContactToCampaign } from './uploadContactToCampaign'
import { GridspaceClient } from '../../lib'
import { generateTestPayload } from '@/tests'

jest.mock('../../lib/client')
const mockUploadContactsToCampaign = jest
  .spyOn(GridspaceClient.prototype, 'uploadContactsToCampaign')
  .mockImplementation(() => {
    return Promise.resolve({ num_uploaded_contacts: 1 })
  })

describe('uploadContactToCampaign', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(uploadContactToCampaign)

  beforeEach(() => {
    clearMocks()
    mockUploadContactsToCampaign.mockClear()
  })

  it('should upload contact to the Gridspace autodialer campaign and complete the activity', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          campaignId: 'campaign123',
          data: JSON.stringify({ first_name: 'John', last_name: 'Doe' }),
          phoneNumber: '15552223333',
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

    expect(mockUploadContactsToCampaign).toHaveBeenCalledWith('campaign123', {
      column_names: [
        'phone_number',
        'first_name',
        'last_name',
        'activity_id',
        'pathway_id',
        'pathway_definition_id',
        'patient_id',
      ],
      phone_number_column_name: 'phone_number',
      contact_rows: [
        [
          '15552223333',
          'John',
          'Doe',
          'activity-id',
          'pathway-id',
          'pathway-definition-id',
          'test-patient',
        ],
      ],
    })

    expect(onComplete).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Contact uploaded to campaign campaign123' },
        },
      ],
      data_points: {
        num_uploaded_contacts: '1',
      },
    })
  })

  it('should complete the activity with a failure message if no contacts were uploaded', async () => {
    mockUploadContactsToCampaign.mockResolvedValueOnce({
      num_uploaded_contacts: 0,
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          campaignId: 'campaign123',
          data: JSON.stringify({ first_name: 'John', last_name: 'Doe' }),
          phoneNumber: '15552223333',
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

    expect(onComplete).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Contact was NOT uploaded to campaign campaign123' },
        },
      ],
      data_points: {
        num_uploaded_contacts: '0',
      },
    })
  })

  it('should throw an error if API call fails', async () => {
    mockUploadContactsToCampaign.mockRejectedValueOnce(new Error('API error'))

    await expect(
      extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            campaignId: 'campaign123',
            data: JSON.stringify({ first_name: 'John', last_name: 'Doe' }),
            phoneNumber: '15552223333',
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
    ).rejects.toThrow('API error')

    expect(mockUploadContactsToCampaign).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
