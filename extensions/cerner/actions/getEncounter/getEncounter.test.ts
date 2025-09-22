import { TestHelpers } from '@awell-health/extensions-core'
import { getEncounter as action } from './getEncounter'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { GetEncounterMockResponse } from './__testdata__/GetEncounter.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Get encounter', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is found', () => {
    test('Should return the encounter', async () => {
      const mockGetEncounter = jest
        .fn()
        .mockResolvedValue({ data: GetEncounterMockResponse })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          getEncounter: mockGetEncounter,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: '97939518',
          },
          settings: {
            tenantId: 'some-tenant-id',
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          encounter: JSON.stringify(GetEncounterMockResponse),
        },
      })
    })
  })

  describe('When the encounter is not found', () => {
    test('Should return an error', async () => {
      const mockGetEncounter = jest
        .fn()
        .mockRejectedValue(
          createAxiosError(404, 'Not Found', JSON.stringify({})),
        )
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          getEncounter: mockGetEncounter,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: '999',
          },
          settings: {
            tenantId: 'some-tenant-id',
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Encounter not found' },
          },
        ],
      })
    })
  })
})
