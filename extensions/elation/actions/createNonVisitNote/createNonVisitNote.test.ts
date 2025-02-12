import { createNonVisitNote as action } from '.'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { nonVisitNoteSchema } from '../../validation/nonVisitNote.zod'
import { TestHelpers } from '@awell-health/extensions-core'
import { CreateNonVisitNoteMock } from './__testdata__/CreateNonVisitNote.mock'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

describe('Elation - Create non-visit note', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockCreateNonVisitNote = jest.fn()

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    clearMocks()
  })

  describe('Validation - nonVisitNoteSchema', () => {
    test('Should work undefined category', async () => {
      const test = nonVisitNoteSchema.parse({
        patient: 1,
        bullets: [{ text: 'Text', author: 2, category: undefined }],
        document_date: new Date().toISOString(),
        chart_date: new Date().toISOString(),
        tags: undefined,
      })

      expect(test).toEqual({
        type: 'nonvisit',
        patient: 1,
        bullets: [{ text: 'Text', author: 2, category: undefined }],
        document_date: expect.any(String),
        chart_date: expect.any(String),
        tags: undefined,
      })
    })
  })

  describe('When the non-visit note is created', () => {
    beforeEach(() => {
      mockCreateNonVisitNote.mockResolvedValue(CreateNonVisitNoteMock)
    })

    test('Should return with correct data_points', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            patientId: nonVisitNoteResponseExample.patient,
            authorId: nonVisitNoteResponseExample.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: nonVisitNoteResponseExample.bullets[0].text,
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nonVisitNoteId: String(nonVisitNoteResponseExample.id),
          nonVisitNoteBulletId: String(
            nonVisitNoteResponseExample.bullets[0].id,
          ),
        },
      })
    })
  })
})
