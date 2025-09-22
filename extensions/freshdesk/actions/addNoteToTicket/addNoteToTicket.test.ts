import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { addNoteToTicket as action } from './addNoteToTicket'
import { AddNoteResponseMock } from './__mocks__/AddNoteResponse.mock'
import { createAxiosError } from '../../../../tests'

describe('Freshdesk - Add note to ticket', () => {
  let addNoteSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      addNoteSpy = jest
        .spyOn(FreshdeskApiClient.prototype, 'addNote')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(AddNoteResponseMock),
        )
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
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('When ticket to update is not found', () => {
    beforeEach(() => {
      addNoteSpy = jest
        .spyOn(FreshdeskApiClient.prototype, 'addNote')
        .mockImplementationOnce(
          jest
            .fn()
            .mockRejectedValue(
              createAxiosError(404, 'Not Found', JSON.stringify({})),
            ),
        )
    })

    test('Should call onError', async () => {
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
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: {
              en: 'Ticket to add note to not found (404)',
            },
          }),
        ]),
      })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
