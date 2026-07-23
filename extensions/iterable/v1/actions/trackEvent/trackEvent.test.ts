import {
  IterableClientMockImplementation,
  mockTrackEventActionFields,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { trackEvent } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Iterable - Track event', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(trackEvent)

  const basePayload = generateTestPayload({
    fields: {
      ...mockTrackEventActionFields,
      dataFields: JSON.stringify(mockTrackEventActionFields.dataFields),
    },
    settings: {
      apiKey: 'apiKey',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await trackEvent.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      IterableClientMockImplementation.eventsApi.trackEvent,
    ).toHaveBeenCalledWith(mockTrackEventActionFields)
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
