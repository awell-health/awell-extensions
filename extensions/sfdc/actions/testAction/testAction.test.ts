import { testAction } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../api/__mocks__'

jest.mock('../../api/client')

describe('Salesforce - Test action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Test retrieval of record shape', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        sObject: 'Lead',
      },
      settings: mockSettings,
    })

    await testAction.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    const mockCall = onComplete.mock.calls[0][0]
    const parsedRes = JSON.parse(mockCall.data_points.res)

    expect(onComplete).toHaveBeenCalled()
    expect(parsedRes).toHaveProperty('label', 'Lead')
  })
})
