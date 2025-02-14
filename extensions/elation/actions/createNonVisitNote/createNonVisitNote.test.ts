import { createNonVisitNote as action } from '.'
import { makeAPIClient } from '../../client'
import { nonVisitNoteSchema } from '../../validation/nonVisitNote.zod'
import { TestHelpers } from '@awell-health/extensions-core'
import { CreateNonVisitNoteMock } from './__testdata__/CreateNonVisitNote.mock'
import { createAxiosError } from '../../../../tests'

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
    mockAPIClient.mockImplementation(() => ({
      createNonVisitNote: mockCreateNonVisitNote,
    }))
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
            patientId: CreateNonVisitNoteMock.data.patient,
            authorId: CreateNonVisitNoteMock.data.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: CreateNonVisitNoteMock.data.bullets[0].text,
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreateNonVisitNote).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nonVisitNoteId: String(CreateNonVisitNoteMock.data.id),
          nonVisitNoteBulletId: String(
            CreateNonVisitNoteMock.data.bullets[0].id,
          ),
        },
      })
    })
  })

  describe('When the non-visit note creation fails', () => {
    beforeEach(() => {
      mockCreateNonVisitNote.mockRejectedValue(
        createAxiosError(
          400,
          'Bad Request',
          JSON.stringify({
            patient: ['Invalid pk "1" - object does not exist.'],
          }),
        ),
      )
    })

    test('Should return with correct data_points', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            patientId: CreateNonVisitNoteMock.data.patient,
            authorId: CreateNonVisitNoteMock.data.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: CreateNonVisitNoteMock.data.bullets[0].text,
          },
          settings,
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
              en: '400: Bad Request\n{\n  "patient": [\n    "Invalid pk \\"1\\" - object does not exist."\n  ]\n}',
            },
          },
        ],
      })
    })
  })
})
