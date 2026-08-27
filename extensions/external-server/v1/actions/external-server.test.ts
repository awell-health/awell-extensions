import axios from 'axios'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../tests/constants'
import { externalServer } from './external-extension'
import { mtls } from './mtls'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('external-server actions tolerate an unset optional field', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: { data_points: {}, events: [], response: 'success' },
    })
  })

  it('externalServer: missing `input` falls back to an empty payload', async () => {
    const { extensionAction, onComplete, onError, helpers } =
      TestHelpers.fromAction(externalServer)
    await extensionAction.onActivityCreated!(
      generateTestPayload({
        fields: { extension: 'ext', action: 'act' } as any,
        settings: { url: 'https://example.com' },
      }),
      onComplete,
      onError,
      helpers,
    )
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://example.com/ext/act',
      { data: { fields: {}, settings: {} } },
      expect.anything(),
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('mtls: missing `payload` sends an empty data object', async () => {
    const { extensionAction, onComplete, onError, helpers } =
      TestHelpers.fromAction(mtls)
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {} as any,
        settings: { url: 'https://example.com' },
      }),
      onComplete,
      onError,
      helpers: { ...helpers, httpsAgent: () => undefined } as any,
      attempt: 1,
    })
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://example.com',
      { data: {} },
      expect.anything(),
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
