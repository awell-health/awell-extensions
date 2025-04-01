import { createPatient as action } from '.'
import { makeAPIClient } from '../../client'
import { TestHelpers } from '@awell-health/extensions-core'
import { createAxiosError } from '../../../../tests'
import { CreatePatientSuccessMock } from './__testdata__/createPatient.mock'
import { FieldsValidationSchema } from './config/fields'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

describe('Elation - Create patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockCreatePatient = jest.fn()

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      createPatient: mockCreatePatient,
    }))
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  describe('Action fields validation', () => {
    test('Should work parse action fields', async () => {
      const parsedFields = FieldsValidationSchema.parse({
        firstName: 'Turtle',
        lastName: 'Awell',
        dob: '1940-08-29T00:00:00.000Z', // Should be converted to date only string
        sex: 'Male',
        primaryPhysicianId: 141127177601026,
        caregiverPracticeId: 141127173275652,
        email: 'john@doe.com',
        mobilePhone: '+12133734253',
        middleName: 'P',
        actualName: 'local test action',
        genderIdentity: 'man',
        legalGenderMarker: 'M',
        pronouns: 'he_him_his',
        sexualOrientation: 'unknown',
        ssn: '123456789',
        ethnicity: 'Not Hispanic or Latino',
        race: 'Asian',
        preferredLanguage: 'English',
        notes: 'This is test Notes',
        previousFirstName: 'Monkey',
        previousLastName: 'Awell',
        tags: 'tag1, tag2, tag3', // Should be converted to array
      })

      expect(parsedFields).toEqual({
        ...parsedFields,
        dob: '1940-08-29',
        tags: ['tag1', 'tag2', 'tag3'],
      })
    })
  })

  describe('When the patient is created', () => {
    beforeEach(() => {
      mockCreatePatient.mockResolvedValue(CreatePatientSuccessMock)
    })

    test('Should return with correct data_points', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            firstName: 'Test',
            middleName: 'P',
            lastName: 'Action',
            email: 'john@doe.com',
            mobilePhone: '+12133734253',
            actualName: 'local test action',
            genderIdentity: 'man',
            legalGenderMarker: 'M',
            pronouns: 'he_him_his',
            sex: 'Male',
            sexualOrientation: 'unknown',
            primaryPhysicianId: 141127177601026,
            caregiverPracticeId: 141127173275652,
            dob: '1940-08-29',
            ssn: '123456789',
            race: 'Asian',
            preferredLanguage: 'English',
            ethnicity: 'Not Hispanic or Latino',
            notes: 'This is test Notes',
            previousFirstName: '',
            previousLastName: '',
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreatePatient).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          patientId: String(CreatePatientSuccessMock.data.id),
        },
      })
    })
  })

  describe('When the patient is not created', () => {
    describe('When the patient already exists', () => {
      const existingPatientId = 142857632874497

      beforeEach(() => {
        mockCreatePatient.mockRejectedValue(
          createAxiosError(
            409,
            'Conflict',
            JSON.stringify({
              detail: 'Duplicated object',
              redirect: existingPatientId,
            }),
          ),
        )
      })

      test('Should return the existing patient id', async () => {
        await extensionAction.onEvent!({
          payload: {
            fields: {
              firstName: 'Nick Test',
              lastName: 'Test',
              dob: '1993-11-30',
              sex: 'Male',
              primaryPhysicianId: 141377681883138,
              caregiverPracticeId: 141127173275652,
            },
            settings,
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(mockCreatePatient).toHaveBeenCalled()
        expect(onError).not.toHaveBeenCalled()
        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            patientId: String(existingPatientId),
          },
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'Patient already exists. Returning the existing patient id.',
              },
            },
          ],
        })
      })
    })

    describe('When payload is invalid', () => {
      beforeEach(() => {
        mockCreatePatient.mockRejectedValue(
          createAxiosError(
            400,
            'Bad Request',
            JSON.stringify({
              caregiver_practice: [
                'Invalid pk "141127173275652" - object does not exist.',
              ],
              primary_physician: ['This field is required.'],
            }),
          ),
        )
      })

      test('Should throw the error', async () => {
        await expect(
          extensionAction.onEvent!({
            payload: {
              fields: {
                firstName: 'Nick Test',
                lastName: 'Test',
                dob: '1993-11-30',
                sex: 'Male',
                primaryPhysicianId: 141377681883138,
                caregiverPracticeId: 141127173275652,
              },
              settings,
            } as any,
            onComplete,
            onError,
            helpers,
          }),
        ).rejects.toThrow()

        expect(mockCreatePatient).toHaveBeenCalled()
        expect(onComplete).not.toHaveBeenCalled()
      })
    })
  })
})
