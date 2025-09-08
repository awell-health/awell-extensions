import { TestHelpers } from '@awell-health/extensions-core'
import { getMedicationRequest as action } from './getMedicationRequest'
import { MedplumClient } from '@medplum/core'
import { MedicationRequestMock } from './__testdata__/MedicationRequest.mock'

jest.mock('@medplum/core')

describe('Medplum - Get medication request', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockReadResource = jest.fn()

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    const mockedMedplumClient = jest.mocked(MedplumClient)
    mockedMedplumClient.mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        readResource: mockReadResource,
      } as unknown as MedplumClient
    })
  })

  describe('When the MedicationRequest is found', () => {
    beforeAll(() => {
      mockReadResource.mockResolvedValue(MedicationRequestMock)
    })

    test('Should return the MedicationRequest with extracted data points', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: MedicationRequestMock.id,
          },
          pathway: {
            id: 'some-pathway-id',
          },
          activity: {
            id: 'some-activity-id',
          },
          settings: {
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          medicationRequest: JSON.stringify(MedicationRequestMock),
          status: MedicationRequestMock.status,
          intent: MedicationRequestMock.intent,
          priority: undefined,
          medicationDisplay: 'Nystatin 100,000 u/ml oral suspension',
          dosageInstructions: '10 drops four times daily - apply in mouth using cotton swab or finger',
          patientId: 'pat1',
        },
      })
    })
  })
})
