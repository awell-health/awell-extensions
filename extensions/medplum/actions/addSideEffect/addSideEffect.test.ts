import { addSideEffect } from '.'
import { generateTestPayload } from '@/tests'
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
describe.skip('Medplum - Add side effect to medication request', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        medicationRequestId: '2efed325-ab4a-4b65-9118-9c79f4626f3a',
        sideEffect: 'A new side effect',
      },
      settings: {
        ...mockSettings,
      },
    })

    await addSideEffect.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })
})
