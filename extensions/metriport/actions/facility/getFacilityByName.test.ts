import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { createMetriportApi } from '../../client'
import { getFacilityByName } from './getFacilityByName'

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

const facility = {
  id: 'facility-1',
  name: 'Awell Clinic',
  npi: '1234567893',
  tin: '12-3456789',
  active: true,
  address: {
    addressLine1: '2261 Market Street',
    addressLine2: 'Suite 4818',
    city: 'San Francisco',
    state: 'CA',
    zip: '94114',
    country: 'USA',
  },
}

describe('Metriport - Get Facility by Name', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getFacilityByName)
  const listFacilities = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
    mockedCreateMetriportApi.mockReturnValue({
      listFacilities,
    } as never)
  })

  const invoke = async (name: string): Promise<void> => {
    await getFacilityByName.onEvent!({
      payload: generateTestPayload({
        fields: { facilityName: name },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
  }

  test('Should return the facility data points when exactly one facility matches', async () => {
    listFacilities.mockResolvedValue([
      { ...facility, id: 'facility-0', name: 'Other Clinic' },
      facility,
    ])

    await invoke('Awell Clinic')

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        facilityId: 'facility-1',
        facilityName: 'Awell Clinic',
        npi: '1234567893',
        tin: '12-3456789',
        active: 'true',
        addressLine1: '2261 Market Street',
        addressLine2: 'Suite 4818',
        city: 'San Francisco',
        state: 'CA',
        zip: '94114',
        country: 'USA',
      },
    })
  })

  test('Should match the name case-insensitively and ignore surrounding whitespace', async () => {
    listFacilities.mockResolvedValue([{ ...facility, name: '  Awell Clinic ' }])

    await invoke('awell clinic')

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({ facilityId: 'facility-1' }),
      }),
    )
  })

  test('Should not match a facility whose name merely contains the given name', async () => {
    listFacilities.mockResolvedValue([
      { ...facility, name: 'Awell Clinic North' },
    ])

    await invoke('Awell Clinic')

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message: 'No Facility found with the name "Awell Clinic"',
          },
        }),
      ],
    })
  })

  test('Should call onError when no facility matches', async () => {
    listFacilities.mockResolvedValue([
      { ...facility, name: 'Other Clinic' },
      { ...facility, name: 'Another Clinic' },
    ])

    await invoke('Awell Clinic')

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message: 'No Facility found with the name "Awell Clinic"',
          },
        }),
      ],
    })
  })

  test('Should call onError when more than one facility matches', async () => {
    listFacilities.mockResolvedValue([
      facility,
      { ...facility, id: 'facility-2', name: 'awell clinic' },
      { ...facility, id: 'facility-3', name: 'AWELL CLINIC' },
    ])

    await invoke('Awell Clinic')

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message:
              '3 Facilities found with the name "Awell Clinic". The name must identify exactly one Facility.',
          },
        }),
      ],
    })
  })

  test('Should call onError when the name is empty', async () => {
    await invoke('   ')

    expect(listFacilities).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'WRONG_INPUT' }),
        }),
      ],
    })
  })

  test('Should omit optional facility values that Metriport does not return', async () => {
    listFacilities.mockResolvedValue([
      {
        id: 'facility-1',
        name: 'Awell Clinic',
        npi: '1234567893',
        address: {
          addressLine1: '2261 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94114',
        },
      },
    ])

    await invoke('Awell Clinic')

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        facilityId: 'facility-1',
        facilityName: 'Awell Clinic',
        npi: '1234567893',
        tin: undefined,
        active: undefined,
        addressLine1: '2261 Market Street',
        addressLine2: undefined,
        city: 'San Francisco',
        state: 'CA',
        zip: '94114',
        country: undefined,
      },
    })
  })
})
