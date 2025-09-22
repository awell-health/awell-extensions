import { TestHelpers } from '@awell-health/extensions-core'
import { getPatientEncounters as action } from './getPatientEncounters'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import {
  GetPatientEncountersMockResponse,
  GetPatientEncountersNoResultsMockResponse,
} from './__testdata__/GetPatientEncounters.mock'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Get patient encounters', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When at least one encounter is found', () => {
    beforeEach(() => {
      const mockSearchEncounter = jest
        .fn()
        .mockResolvedValue({ data: GetPatientEncountersMockResponse })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          searchEncounter: mockSearchEncounter,
        } as unknown as CernerR4APIClient
      })
    })

    test('Should return the encounters', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            patientResourceId: '12724066',
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
          encounters: JSON.stringify(GetPatientEncountersMockResponse.entry),
        },
      })
    })
  })

  describe('When no encounter found', () => {
    beforeEach(() => {
      const mockSearchEncounter = jest
        .fn()
        .mockResolvedValue({ data: GetPatientEncountersNoResultsMockResponse })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          searchEncounter: mockSearchEncounter,
        } as unknown as CernerR4APIClient
      })
    })

    test('Should return an error', async () => {
      const res = extensionAction.onEvent({
        payload: {
          fields: {
            patientResourceId: 'something',
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

      await expect(res).rejects.toThrow('No encounters found')
    })
  })
})
