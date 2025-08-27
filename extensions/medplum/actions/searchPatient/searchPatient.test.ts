import { searchPatient } from './searchPatient'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Search patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should search for patient by parameter', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: '12345',
      },
      settings: mockSettings,
    })

    await searchPatient.onActivityCreated!(mockPayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: expect.any(String),
        searchResults: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
