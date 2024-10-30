import {
  IterableClientMockImplementation,
  mockTrackEventActionFields,
} from '../../client/__mocks__'
import { trackEvent } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Iterable - Track event', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
  })

  test('Should call the onComplete callback', async () => {
    await trackEvent.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      IterableClientMockImplementation.eventsApi.trackEvent
    ).toHaveBeenCalledWith(mockTrackEventActionFields)
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
