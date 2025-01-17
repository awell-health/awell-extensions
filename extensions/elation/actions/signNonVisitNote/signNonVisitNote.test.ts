import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { signNonVisitNote as action } from './signNonVisitNote'
import { TestHelpers } from '@awell-health/extensions-core'

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

  describe('When the signedBy field is not a valid physician', () => {
    beforeEach(() => {
      mockGetPhysician.mockRejectedValue({
        detail: 'No PhysicianProxy matches the given query.',
      })
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

  describe('When the signedBy field is a valid physician', () => {
    beforeEach(() => {
      mockGetPhysician.mockResolvedValue({
        id: 141402084933634,
      })
      mockUpdateNonVisitNote.mockResolvedValue({})
    })

    test('Should return the correct letter', async () => {
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
