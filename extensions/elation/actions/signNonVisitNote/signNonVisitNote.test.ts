import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { signNonVisitNote as action } from './signNonVisitNote'
import { TestHelpers } from '@awell-health/extensions-core'
import { createAxiosError } from '../../../../tests'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

describe('Elation - Sign non-visit note', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockGetPhysician = jest.fn()
  const mockUpdateNonVisitNote = jest.fn()

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      getPhysician: mockGetPhysician,
      updateNonVisitNote: mockUpdateNonVisitNote,
    }))
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  describe('Exceptions', () => {
    describe('When the signedBy field is not a valid physician', () => {
      beforeEach(() => {
        mockGetPhysician.mockRejectedValue(
          createAxiosError(
            404,
            'Not Found',
            JSON.stringify({
              detail: 'No PhysicianProxy matches the given query.',
            }),
          ),
        )
        mockUpdateNonVisitNote.mockResolvedValue({})
      })

      test('Should return an error', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              nonVisitNoteId: 142685415604249,
              signedBy: 141402084933634,
            },
            settings: {
              client_id: 'clientId',
              client_secret: 'clientSecret',
              username: 'username',
              password: 'password',
              auth_url: 'authUrl',
              base_url: 'baseUrl',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'Failed to retrieve the physician (141402084933634) to sign the note. Non-visit notes have to be signed by a physician.',
              },
            },
          ],
        })
      })
    })

    describe('When the non-visit note does not exist', () => {
      beforeEach(() => {
        mockGetPhysician.mockResolvedValue({
          id: 141402084933634,
        })
        mockUpdateNonVisitNote.mockRejectedValue(
          createAxiosError(
            404,
            'Not Found',
            JSON.stringify({
              detail: 'No NonVisitNoteProxy matches the given query.',
            }),
          ),
        )
      })

      test('Should return an error', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              nonVisitNoteId: 142685415604249,
              signedBy: 141402084933634,
            },
            settings: {
              client_id: 'clientId',
              client_secret: 'clientSecret',
              username: 'username',
              password: 'password',
              auth_url: 'authUrl',
              base_url: 'baseUrl',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'The non-visit note (142685415604249) does not exist.',
              },
            },
          ],
        })
      })
    })

    describe('When the non-visit note is already signed', () => {
      beforeEach(() => {
        mockGetPhysician.mockResolvedValue({
          id: 141402084933634,
        })
        mockUpdateNonVisitNote.mockRejectedValue(
          createAxiosError(
            400,
            'Bad Request',
            JSON.stringify(['signed non visit notes are not editable']),
          ),
        )
      })

      test('Should return an error', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              nonVisitNoteId: 142685415604249,
              signedBy: 141402084933634,
            },
            settings: {
              client_id: 'clientId',
              client_secret: 'clientSecret',
              username: 'username',
              password: 'password',
              auth_url: 'authUrl',
              base_url: 'baseUrl',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'Non-visit note was already signed and cannot be signed again.',
              },
            },
          ],
        })
      })
    })
  })

  describe('Happy path', () => {
    beforeEach(() => {
      mockGetPhysician.mockResolvedValue({
        id: 141402084933634,
      })
      mockUpdateNonVisitNote.mockResolvedValue({})
    })

    test('Should sign the non-visit note', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            nonVisitNoteId: 142685415604249,
            signedBy: 141402084933634,
          },
          settings: {
            client_id: 'clientId',
            client_secret: 'clientSecret',
            username: 'username',
            password: 'password',
            auth_url: 'authUrl',
            base_url: 'baseUrl',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
    })
  })
})
