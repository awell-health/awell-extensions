import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { getPatient } from '../getPatient'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('getPatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    const mockSdk = getSdk as jest.Mock
    mockSdk.mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    { healthiePhone: '+1 (555) 555-1234', validatedPhone: '+15555551234' },
    { healthiePhone: '+48 123 456 789', validatedPhone: '+48123456789' },
    { healthiePhone: '(+48) 123 456/789', validatedPhone: '+48123456789' },
  ])(
    'Should parse phone to $validatedPhone when healthie returns $healthiePhone',
    async ({ healthiePhone, validatedPhone }) => {
      const returnValue = mockGetSdkReturn.getUser({})
      mockGetSdkReturn.getUser.mockReturnValueOnce({
        data: {
          user: {
            ...returnValue.data.user,
            phone_number: healthiePhone,
          },
        },
      })

      await getPatient.onActivityCreated(
        {
          activity: {
            id: 'activity-id',
          },
          patient: { id: 'test-patient' },
          fields: {
            patientId: 'patient-1',
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        },
        onComplete,
        jest.fn()
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          firstName: returnValue.data.user.first_name,
          lastName: returnValue.data.user.last_name,
          dob: returnValue.data.user.dob,
          email: returnValue.data.user.email,
          gender: returnValue.data.user.gender,
          phoneNumber: healthiePhone,
          validatedPhoneNumber: validatedPhone,
          groupName: returnValue.data.user.user_group.name,
          primaryProviderId: returnValue.data.user.dietitian_id,
        },
        events: undefined,
      })
    }
  )
})
