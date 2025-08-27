import { searchPatient } from './searchPatient'
import { generateTestPayload } from '../../../../src/tests'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Search patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should search for patient by parameter', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: '12345',
      },
      settings: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        baseUrl: 'https://api.medplum.com/',
      },
    })

    await searchPatient.onActivityCreated(mockPayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: expect.any(String),
        searchResults: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
