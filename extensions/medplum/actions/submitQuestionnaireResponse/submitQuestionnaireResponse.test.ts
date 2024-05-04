/**
 * TODO: write tests
 * Uncomment what is below as it's a good start
 */

import { submitQuestionnaireResponse } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe.skip('Medplum - Submit questionnaire response', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should submit a questionnaire response', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {},
      settings: mockSettings,
      pathway: {
        id: 'LldfGZ7x1rZx',
      },
      activity: {
        id: 'vFTGRflHTL1iUVCzHhHts',
      },
    })

    await submitQuestionnaireResponse.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })
})
