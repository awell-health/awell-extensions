import { makeAPIClient } from '../../client'
import { FindContactsResponse } from '../../types/contact'
import { referralOrderExample } from '../../__mocks__/constants'
import { createReferralOrder } from './createReferralOrder'

// Add mock API client
const mockElationAPIClient = {
  searchContactsByName: jest.fn().mockResolvedValue({
    count: 1,
    results: [{ id: 1 }, { id: 2 }],
  } as FindContactsResponse),
  createReferralOrder: jest.fn().mockResolvedValue(referralOrderExample),
  postNewLetter: jest.fn().mockResolvedValue({ id: 'letter_123' }),
}

// Mock the makeAPIClient function
jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockElationAPIClient),
}))

describe('Elation - Create referral order', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    onComplete.mockClear()
    onError.mockClear()
  })

  const payload = {
    fields: {
      patient: 83658080257,
      practice: 75435474948,
      body: 'This is a test body',
      authorization_for: 'Referral For Treatment, includes Consult Visit',
      contact_name: 'A contact',
      specialty: 'Unit testing',
      consultant_name: 'Dr. Smith',
    },
    settings: {
      client_id: 'clientId',
      client_secret: 'clientSecret',
      username: 'username',
      password: 'password',
      auth_url: 'authUrl',
      base_url: 'baseUrl',
      openAiApiKey: 'some_key',
    },
    activity: {
      id: '123',
    },
    pathway: {
      definition_id: '123',
      id: '123',
      tenant_id: '123',
      org_id: '123',
      org_slug: 'org-slug',
    },
    patient: {
      id: '123',
    },
  }

  test('Should return the referral order id as data point', async () => {
    await createReferralOrder.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { id: String(referralOrderExample.id) },
    })
  })

  test('Should create a letter with the referral order id', async () => {
    await createReferralOrder.onActivityCreated!(payload, onComplete, onError)

    expect(mockElationAPIClient.postNewLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        referral_order: referralOrderExample.id,
      }),
    )
  })

  test('Should use the first contact found when creating the letter', async () => {
    await createReferralOrder.onActivityCreated!(payload, onComplete, onError)

    expect(mockElationAPIClient.postNewLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        send_to_contact: { id: 1 }, // Should use the first contact's ID
      }),
    )
  })

  test('Should throw an error if no contact is found', async () => {
    mockElationAPIClient.searchContactsByName.mockImplementationOnce(() => {
      return {
        count: 0,
        results: [],
      } as FindContactsResponse
    })

    await expect(
      createReferralOrder.onActivityCreated!(payload, onComplete, onError),
    ).rejects.toThrow('No contact found with the name A contact.')
  })
})
