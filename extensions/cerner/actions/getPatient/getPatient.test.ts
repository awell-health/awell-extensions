import { TestHelpers } from '@awell-health/extensions-core'
import { getPatient as action } from './getPatient'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { patientReadMock } from './__testdata__/PatientRead.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Get patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is found', () => {
    test('Should return the patient', async () => {
      const mockGetPatient = jest
        .fn()
        .mockResolvedValue({ data: patientReadMock })
      const mockedEpicClient = jest.mocked(CernerR4APIClient)

      mockedEpicClient.mockImplementation(() => {
        return {
          getPatient: mockGetPatient,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: '12724067',
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
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          patient: JSON.stringify(patientReadMock),
        },
      })
    })
  })

  describe('When the patient is not found', () => {
    test('Should return an error', async () => {
      const mockGetPatient = jest.fn().mockRejectedValue(
        createAxiosError(
          404,
          'Not Found',
          JSON.stringify({
            resourceType: 'OperationOutcome',
            issue: [
              {
                severity: 'error',
                code: 'not-found',
                details: {
                  text: 'Resource not found',
                },
              },
            ],
          }),
        ),
      )
      const mockedEpicClient = jest.mocked(CernerR4APIClient)

      mockedEpicClient.mockImplementation(() => {
        return {
          getPatient: mockGetPatient,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: '12724067',
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
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Patient not found' },
          },
        ],
      })
    })
  })
})
