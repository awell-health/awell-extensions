import { TestHelpers } from '@awell-health/extensions-core'
import { createOrUpdateContact } from '.'
import { Client } from '@hubspot/api-client'
import { generateTestPayload } from '../../../../tests'
import { ApiException } from '@hubspot/api-client/lib/codegen/crm/contacts'

jest.mock('@hubspot/api-client')

describe('HubSpot - Get contact', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(createOrUpdateContact)

  const mockGetById = jest.fn()
  const mockCreate = jest.fn()
  const mockUpdate = jest.fn()

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  beforeAll(() => {
    const mockedHubspotClient = jest.mocked(Client)
    mockedHubspotClient.mockImplementation(() => {
      return {
        crm: {
          contacts: {
            basicApi: {
              getById: mockGetById,
              create: mockCreate,
              update: mockUpdate,
            },
          },
        },
      } as unknown as Client
    })
  })

  describe('Contact does exist', () => {
    beforeEach(() => {
      const existingResource = {
        id: '107388952666',
        properties: {
          email: 'existing-contact@awellhealth.com',
          firstname: 'Nick',
          lastname: 'Hellemans',
        },
        updatedAt: '2025-03-19T20:49:59.249Z',
      }

      mockGetById.mockResolvedValue(existingResource)
      mockUpdate.mockResolvedValue({
        ...existingResource,
        properties: {
          ...existingResource.properties,
          firstName: 'Updated first name',
        },
      })
    })

    test('Should retrieve and update contact', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            identifierMode: 'email',
            email: 'existing-contact@awellhealth.com',
            firstName: 'Updated first name',
          },
          settings: {
            accessToken: 'accessToken',
          },
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(mockGetById).toHaveBeenCalledWith(
        'existing-contact@awellhealth.com',
        undefined,
        undefined,
        undefined,
        false,
        'email',
      )
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hubspotContactId: '107388952666',
          contactResource: JSON.stringify({
            id: '107388952666',
          }),
        },
        events: expect.arrayContaining([
          expect.objectContaining({
            text: {
              en: 'Existing contact found in Hubspot with email existing-contact@awellhealth.com. Contact ID: 107388952666',
            },
          }),
          expect.objectContaining({
            text: {
              en: 'Contact updated in Hubspot with email existing-contact@awellhealth.com. Contact ID: 107388952666',
            },
          }),
        ]),
      })
    })
  })

  describe('Contact does not exist', () => {
    beforeEach(() => {
      mockGetById.mockRejectedValue(
        new ApiException(404, 'Resource not found', JSON.stringify({}), {}),
      )
      mockCreate.mockResolvedValue({
        createdAt: '2025-03-19T22:28:16.724Z',
        id: '107363504259',
        properties: {
          createdate: '2025-03-19T22:28:16.724Z',
          email: 'new-contact@awellhealth.com',
          firstname: 'Nick',
          lastname: 'Awell',
        },
      })
    })

    test('Should create contact', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            identifierMode: 'email',
            email: 'new-contact@awellhealth.com',
            firstName: 'Nick',
            lastName: 'Awell',
            customProperties: JSON.stringify({
              customProperty: 'hello world',
            }),
          },
          settings: {
            accessToken: 'accessToken',
          },
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(mockGetById).toHaveBeenCalledWith(
        'new-contact@awellhealth.com',
        undefined,
        undefined,
        undefined,
        false,
        'email',
      )
      expect(mockCreate).toHaveBeenCalledWith({
        associations: [],
        properties: {
          email: 'new-contact@awellhealth.com',
          firstname: 'Nick',
          lastname: 'Awell',
          customProperty: 'hello world',
        },
      })
      expect(mockUpdate).not.toHaveBeenCalled()

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hubspotContactId: '107363504259',
          contactResource: JSON.stringify({
            createdAt: '2025-03-19T22:28:16.724Z',
            id: '107363504259',
            properties: {
              createdate: '2025-03-19T22:28:16.724Z',
              email: 'new-contact@awellhealth.com',
              firstname: 'Nick',
              lastname: 'Awell',
            },
          }),
        },
        events: expect.arrayContaining([
          expect.objectContaining({
            text: {
              en: 'No existing contact found in Hubspot with email new-contact@awellhealth.com.',
            },
          }),
          expect.objectContaining({
            text: {
              en: 'Contact created in Hubspot with email new-contact@awellhealth.com. Contact ID: 107363504259',
            },
          }),
        ]),
      })
    })
  })
})
