import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { addNoteToTicket as action } from './addNoteToTicket'
import { AddNoteResponseMock } from './__mocks__/AddNoteResponse.mock'

describe('Freshdesk - Add note to ticket', () => {
  let addNoteSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    addNoteSpy = jest
      .spyOn(FreshdeskApiClient.prototype, 'addNote')
      .mockImplementationOnce(jest.fn().mockResolvedValue(AddNoteResponseMock))
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          ticketId: '1',
          body: 'Note content',
        },
        settings: {
          domain: 'domain',
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
