import { createCalculationObservation } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

/**
 * Add tests later
 */
describe.skip('Medplum - Create calculation observation', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a calculation observation', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
        questionnaireResponseId: 'abc',
      },
      pathway: {
        id: '3P9PnTa50RD8',
      },
      activity: {
        id: 'uHiNInqiX-rhfnJEl0mcE',
      },
      settings: {
        ...mockSettings,
      },
    })

    await createCalculationObservation.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        observationId: 'some-id',
      },
    })
  })
})
