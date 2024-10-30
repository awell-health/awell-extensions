import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { getPatient } from '../getPatient'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('getPatient action', () => {
  const onComplete = jest.fn()
  const DATE_MOCK = new Date('1990-01-01T00:00:00Z')
  const DATE_FNS_STRING = '1990-01-01T00:00:00Z'

  beforeAll(() => {
    const mockSdk = getSdk as jest.Mock
    mockSdk.mockImplementation(mockGetSdk)
    jest.useFakeTimers()
    jest.setSystemTime(DATE_MOCK)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('phone number validation', () => {
    test.each([
      { healthiePhone: '+1 (555) 555-1234', validatedPhone: '+15555551234' },
      { healthiePhone: '+48 123 456 789', validatedPhone: '+48123456789' },
      { healthiePhone: '(+48) 123 456/789', validatedPhone: '+48123456789' },
      { healthiePhone: '', validatedPhone: undefined },
      { healthiePhone: undefined, validatedPhone: undefined },
    ])(
      '$#. Should parse phone to "$validatedPhone" when healthie returns "$healthiePhone"',
      async ({ healthiePhone, validatedPhone }) => {
        const returnValue = mockGetSdkReturn.getUser({})
        mockGetSdkReturn.getUser.mockReturnValueOnce({
          data: {
            user: {
              ...returnValue.data.user,
              phone_number: healthiePhone as string,
            },
          },
        })

        await getPatient.onActivityCreated!(
          generateTestPayload({
            fields: {
              patientId: 'patient-1',
            },
            settings: {
              apiKey: 'apiKey',
              apiUrl: 'test-url',
            },
          }),
          onComplete,
          jest.fn()
        )

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            firstName: returnValue.data.user.first_name,
            lastName: returnValue.data.user.last_name,
            dob: DATE_FNS_STRING,
            email: returnValue.data.user.email,
            gender: returnValue.data.user.gender,
            isoSex: '2',
            phoneNumber: validatedPhone,
            groupName: returnValue.data.user.user_group.name,
            primaryProviderId: returnValue.data.user.dietitian_id,
          },
          events: undefined,
        })
      }
    )

    test.each([
      { healthiePhone: '555-1234', validatedPhone: undefined },
      { healthiePhone: '(555) 555-1234', validatedPhone: undefined },
    ])(
      '$#. Should log event and return "undefined" for validatedPhone when healthie returns "$healthiePhone"',
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

        await getPatient.onActivityCreated!(
          generateTestPayload({
            fields: {
              patientId: 'patient-1',
            },
            settings: {
              apiKey: 'apiKey',
              apiUrl: 'test-url',
            },
          }),
          onComplete,
          jest.fn()
        )

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            firstName: returnValue.data.user.first_name,
            lastName: returnValue.data.user.last_name,
            dob: DATE_FNS_STRING,
            email: returnValue.data.user.email,
            gender: returnValue.data.user.gender,
            isoSex: '2',
            phoneNumber: validatedPhone,
            groupName: returnValue.data.user.user_group.name,
            primaryProviderId: returnValue.data.user.dietitian_id,
          },
          events: [
            {
              date: DATE_MOCK.toISOString(),
              error: {
                category: 'WRONG_DATA',
                message: `Phone number from Healthie (${String(
                  healthiePhone
                )}) not stored because it isn't a valid E.164 phone number`,
              },
              text: {
                en: `Phone number from Healthie (${String(
                  healthiePhone
                )}) not stored because it isn't a valid E.164 phone number`,
              },
            },
          ],
        })
      }
    )
  })

  describe('dob validation', () => {
    test.each([
      {
        healthieDate: '1990-01-01',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '1990 01 01',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '1990/01/ 01',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '01- 01-1990',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '01 01 1990',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '1990 01 01',
        validatedDate: '1990-01-01T00:00:00Z',
      },
      {
        healthieDate: '',
        validatedDate: undefined,
      },
      {
        healthieDate: undefined,
        validatedDate: undefined,
      },
    ])(
      '$#. Should parse dob to "$validatedDate" when healthie returns "$healthieDate"',
      async ({ healthieDate, validatedDate }) => {
        const returnValue = mockGetSdkReturn.getUser({})
        mockGetSdkReturn.getUser.mockReturnValueOnce({
          data: {
            user: {
              ...returnValue.data.user,
              dob: healthieDate as string,
            },
          },
        })

        await getPatient.onActivityCreated!(
          generateTestPayload({
            fields: {
              patientId: 'patient-1',
            },
            settings: {
              apiKey: 'apiKey',
              apiUrl: 'test-url',
            },
          }),
          onComplete,
          jest.fn()
        )

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            firstName: returnValue.data.user.first_name,
            lastName: returnValue.data.user.last_name,
            dob: validatedDate,
            email: returnValue.data.user.email,
            gender: returnValue.data.user.gender,
            isoSex: '2',
            phoneNumber: '+15555551234',
            groupName: returnValue.data.user.user_group.name,
            primaryProviderId: returnValue.data.user.dietitian_id,
          },
          events: undefined,
        })
      }
    )

    test.each([
      {
        healthieDate: '1990 30 01',
        validatedDate: undefined,
      },
    ])(
      '$#. Should log event and return "undefined" for validatedDate when healthie returns "$healthieDate"',
      async ({ healthieDate, validatedDate }) => {
        const returnValue = mockGetSdkReturn.getUser({})
        mockGetSdkReturn.getUser.mockReturnValueOnce({
          data: {
            user: {
              ...returnValue.data.user,
              dob: healthieDate,
            },
          },
        })

        await getPatient.onActivityCreated!(
          generateTestPayload({
            fields: {
              patientId: 'patient-1',
            },
            settings: {
              apiKey: 'apiKey',
              apiUrl: 'test-url',
            },
          }),
          onComplete,
          jest.fn()
        )

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            firstName: returnValue.data.user.first_name,
            lastName: returnValue.data.user.last_name,
            dob: validatedDate,
            email: returnValue.data.user.email,
            gender: returnValue.data.user.gender,
            isoSex: '2',
            phoneNumber: '+15555551234',
            groupName: returnValue.data.user.user_group.name,
            primaryProviderId: returnValue.data.user.dietitian_id,
          },
          events: [
            {
              date: DATE_MOCK.toISOString(),
              error: {
                category: 'WRONG_DATA',
                message: `DOB from Healthie (${String(
                  healthieDate
                )}) not stored because it isn't a valid ISO8601 date`,
              },
              text: {
                en: `DOB from Healthie (${String(
                  healthieDate
                )}) not stored because it isn't a valid ISO8601 date`,
              },
            },
          ],
        })
      }
    )
  })
})
