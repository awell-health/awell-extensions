import { generateTestPayload } from '@/tests'
import { type FieldValues, TestHelpers } from '@awell-health/extensions-core'
import { createMetriportApi } from '../../client'
import { clearNameLookupCache } from '../../shared/nameLookup'
import { enrollInMonitoring } from './enrollInMonitoring'
import { type enrollInMonitoringFields } from './fields'

jest.mock('../../client')

const mockedCreateMetriportApi = createMetriportApi as jest.MockedFunction<
  typeof createMetriportApi
>

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

type Fields = FieldValues<typeof enrollInMonitoringFields>

const patientFields: Omit<Fields, 'cohortName'> = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  dob: '1940-08-29',
  genderAtBirth: 'F',
  addressLine1: '1 Analytical Engine Way',
  addressLine2: undefined,
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',
  country: undefined,
  driversLicenseValue: undefined,
  driversLicenseState: undefined,
  phone: undefined,
  email: undefined,
}

const wrongInput = (message: string): unknown => ({
  events: [
    expect.objectContaining({
      error: { category: 'WRONG_INPUT', message },
    }),
  ],
})

describe('Metriport - Enroll in Monitoring', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(enrollInMonitoring)
  const listFacilities = jest.fn()
  const listCohorts = jest.fn()
  const createPatient = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
    clearNameLookupCache()
    mockedCreateMetriportApi.mockReturnValue({
      listFacilities,
      listCohorts,
      createPatient,
    } as never)
    listFacilities.mockResolvedValue([
      { id: 'facility-0', name: 'Other Clinic' },
      { id: 'facility-1', name: 'Awell Clinic' },
    ])
    listCohorts.mockResolvedValue({
      cohorts: [
        { id: 'cohort-0', name: 'Other Clinic' },
        { id: 'cohort-1', name: 'Awell Clinic' },
      ],
    })
    createPatient.mockResolvedValue({ id: 'patient-1' })
  })

  const invoke = async (fields: Fields): Promise<void> => {
    await enrollInMonitoring.onEvent!({
      payload: generateTestPayload({ fields, settings }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
  }

  test('creates the patient in the facility sharing the cohort name and enrolls them in that cohort', async () => {
    await invoke({ ...patientFields, cohortName: 'awell clinic' })

    expect(onError).not.toHaveBeenCalled()
    expect(createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ada',
        lastName: 'Lovelace',
        dob: '1940-08-29',
        genderAtBirth: 'F',
        cohorts: ['cohort-1'],
      }),
      'facility-1',
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { patientId: 'patient-1' },
    })
  })

  test('reports WRONG_INPUT and creates nothing when the facility exists but no cohort shares its name', async () => {
    listFacilities.mockResolvedValue([
      { id: 'facility-2', name: 'Orphan Facility' },
    ])

    await invoke({ ...patientFields, cohortName: 'Orphan Facility' })

    expect(createPatient).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      wrongInput('No Cohort found with the name "Orphan Facility"'),
    )
  })

  test('reports both lookups as WRONG_INPUT when neither a cohort nor a facility has that name', async () => {
    await invoke({ ...patientFields, cohortName: 'Missing Clinic' })

    expect(createPatient).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      wrongInput(
        'No Cohort found with the name "Missing Clinic". No Facility found with the name "Missing Clinic"',
      ),
    )
  })

  test('reports WRONG_INPUT and creates nothing when the cohort exists but no facility shares its name', async () => {
    listCohorts.mockResolvedValue({
      cohorts: [{ id: 'cohort-2', name: 'Orphan Cohort' }],
    })

    await invoke({ ...patientFields, cohortName: 'Orphan Cohort' })

    expect(createPatient).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      wrongInput('No Facility found with the name "Orphan Cohort"'),
    )
  })

  test('reports WRONG_INPUT and creates nothing when more than one cohort shares the name', async () => {
    listCohorts.mockResolvedValue({
      cohorts: [
        { id: 'cohort-1', name: 'Awell Clinic' },
        { id: 'cohort-2', name: 'awell clinic' },
      ],
    })

    await invoke({ ...patientFields, cohortName: 'Awell Clinic' })

    expect(createPatient).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      wrongInput(
        '2 Cohorts found with the name "Awell Clinic". The name must identify exactly one Cohort.',
      ),
    )
  })

  test('lists cohorts and facilities once when enrolling several patients in the same cohort', async () => {
    await invoke({ ...patientFields, cohortName: 'Awell Clinic' })
    await invoke({
      ...patientFields,
      firstName: 'Charles',
      lastName: 'Babbage',
      cohortName: 'Awell Clinic',
    })

    expect(createPatient).toHaveBeenCalledTimes(2)
    expect(listCohorts).toHaveBeenCalledTimes(1)
    expect(listFacilities).toHaveBeenCalledTimes(1)
  })

  test('reports WRONG_INPUT when the cohort name is missing', async () => {
    await invoke({ ...patientFields, cohortName: '' })

    expect(createPatient).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'WRONG_INPUT' }),
        }),
      ],
    })
  })
})
