import { TestHelpers } from '@awell-health/extensions-core'
import { createPatient as action } from './createPatient'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { CreateFhirPatientMockResponse } from './__testdata__/CreateFhirPatient.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Create patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is created successfully', () => {
    test('Should call the onComplete callback with the resourceId', async () => {
      const mockCreatePatient = jest
        .fn()
        .mockResolvedValue(CreateFhirPatientMockResponse)
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          createPatient: mockCreatePatient,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            assigningOrganizationId: '9999',
            ssn: '123-45-6789',
            familyName: 'Awell',
            givenName: 'Health',
            email: 'info@awellhealth.com',
            gender: 'female',
            birthDate: '1990-12-12',
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
          resourceId: '13115400',
        },
      })
    })
  })

  describe('When a required field is missing', () => {
    test('Should call the onError callback with the error message', async () => {
      const errorResponse = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'business-rule',
            details: {
              coding: [
                {
                  system:
                    'http://terminology.hl7.org/CodeSystem/operation-outcome',
                  code: 'MSG_PARAM_INVALID',
                  display: "Parameter 'Patient.name' content is invalid",
                },
              ],
              text: 'The value for Patient.name is not supported.',
            },
            diagnostics: 'Patient.name: cannot be blank',
            expression: ['Patient.name'],
          },
        ],
      }

      const mockCreatePatient = jest
        .fn()
        .mockRejectedValue(
          createAxiosError(
            422,
            'Unprocessable Entity',
            JSON.stringify(errorResponse),
          ),
        )
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          createPatient: mockCreatePatient,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            assigningOrganizationId: '9999',
            familyName: 'Awell',
            givenName: 'Health',
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
        events: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            text: {
              en: `Status: 422 (Unprocessable Entity)\n${JSON.stringify(errorResponse, null, 2)}`,
            },
          }),
        ]),
      })
    })
  })
})
