import { executeBot } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Execute bot', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should execute a bot', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        botId: 'abef24f7-90c8-4705-a1d0-174d9c0968c1',
        body: undefined,
      },
      settings: mockSettings,
    })

    await executeBot.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        data: '"Bot executed!"',
      },
    })
  })
})
