import { createNonVisitNote as action } from '.'
import { makeAPIClient } from '../../client'
import { nonVisitNoteSchema } from '../../validation/nonVisitNote.zod'
import { TestHelpers } from '@awell-health/extensions-core'
import { CreateNonVisitNoteMock } from './__testdata__/CreateNonVisitNote.mock'
import { createAxiosError } from '../../../../tests'
import { AwellSdk } from '@awell-health/awell-sdk'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

describe('Elation - Create non-visit note', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const awellSdkMock = {
    utils: new AwellSdk({
      environment: 'sandbox',
      apiKey: 'sth',
    }).utils,
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

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

  /**
   * Non-visit notes in Elation don't support rich text formatting with HTML.
   */
  describe('Non-visit note text content formatting', () => {
    beforeEach(() => {
      mockCreateNonVisitNote.mockResolvedValue(CreateNonVisitNoteMock)
    })

    test('Should pass plain text if input text has no HTML tags', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            patientId: CreateNonVisitNoteMock.data.patient,
            authorId: CreateNonVisitNoteMock.data.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: 'Paragraph1\nNewline\n\nParagraph2',
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreateNonVisitNote).toHaveBeenCalledWith(
        expect.objectContaining({
          bullets: expect.arrayContaining([
            expect.objectContaining({
              text: 'Paragraph1\nNewline\n\nParagraph2',
            }),
          ]),
        }),
      )
    })

    test('Should pass plain text if input text is pure HTML', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            patientId: CreateNonVisitNoteMock.data.patient,
            authorId: CreateNonVisitNoteMock.data.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: '<p>Paragraph</p><ul><li>Item A</li><li>Item B</li></ul>',
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreateNonVisitNote).toHaveBeenCalledWith(
        expect.objectContaining({
          bullets: expect.arrayContaining([
            expect.objectContaining({
              text: 'Paragraph\n- Item A\n- Item B',
            }),
          ]),
        }),
      )
    })

    test('Should pass plain text if input text is a mix of HTML and plain text', async () => {
      await extensionAction.onEvent!({
        payload: {
          fields: {
            patientId: CreateNonVisitNoteMock.data.patient,
            authorId: CreateNonVisitNoteMock.data.bullets[0].author,
            category: undefined,
            tags: undefined,
            text: 'Summary of Adult Protective Services follow-up:\n<p>Important Notice: The content provided is an AI-generated summary of form responses in Care Flow \"Guia Social Support\" (ID: t-M0FZZ7SNkfVqYvP201O).</p>\n<p><strong>Adult Protective Service Follow-up</strong></p>\n<p>• <strong>Did APS follow-up with you?</strong> - Yes<br />• <strong>If yes, what was the outcome?</strong> - test<br />• <strong>Have the patient support goals been completed?</strong> - Guia will follow-up as necessary.</p>\n***This note was transferred to Elation via Awell integration.',
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreateNonVisitNote).toHaveBeenCalledWith(
        expect.objectContaining({
          bullets: expect.arrayContaining([
            expect.objectContaining({
              text: 'Summary of Adult Protective Services follow-up:\nImportant Notice: The content provided is an AI-generated summary of form responses in Care Flow "Guia Social Support" (ID: t-M0FZZ7SNkfVqYvP201O).\n\nAdult Protective Service Follow-up\n\n•Did APS follow-up with you?- Yes\n•If yes, what was the outcome?- test\n•Have the patient support goals been completed?- Guia will follow-up as necessary.\n\n***This note was transferred to Elation via Awell integration.',
            }),
          ]),
        }),
      )
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
