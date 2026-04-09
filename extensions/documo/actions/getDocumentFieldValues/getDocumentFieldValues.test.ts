import { TestHelpers } from '@awell-health/extensions-core'
import { getDocumentFieldValues as action } from './getDocumentFieldValues'

describe('Documo - Get Document Field Values', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockFieldValues = [
    {
      order: 1,
      fieldId: 'field-1',
      name: 'Patient Name',
      type: 'text',
      dateFlag: false,
      data: 'John Doe',
    },
    {
      order: 2,
      fieldId: 'field-2',
      name: 'Date of Birth',
      type: 'date',
      dateFlag: true,
      data: '1990-01-01',
    },
  ]

  beforeEach(() => {
    clearMocks()
    jest.restoreAllMocks()
  })

  describe('When the API returns field values successfully', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFieldValues),
      })
    })

    test('Should call onComplete with fieldValues as JSON string', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            workspaceId: 'ws-123',
            documentId: 'doc-456',
          },
          settings: {
            apiKey: 'test-api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.documo.com/ws/v2/workspaces/ws-123/documents/doc-456/field-values',
        {
          method: 'GET',
          headers: {
            Authorization: 'test-api-key',
            'Content-Type': 'application/json',
          },
        },
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          fieldValues: JSON.stringify(mockFieldValues),
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When the API returns an error', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Document not found'),
      })
    })

    test('Should call onError with appropriate error message', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            workspaceId: 'ws-123',
            documentId: 'doc-invalid',
          },
          settings: {
            apiKey: 'test-api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: 'Documo API error (404): Document not found',
            },
            error: {
              category: 'SERVER_ERROR',
              message: 'Documo API returned 404: Document not found',
            },
          },
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('When fields are missing or invalid', () => {
    test('Should throw when workspaceId is empty', async () => {
      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              workspaceId: '',
              documentId: 'doc-456',
            },
            settings: {
              apiKey: 'test-api-key',
            },
          } as any,
          onComplete,
          onError,
          helpers,
          attempt: 1,
        }),
      ).rejects.toThrow()

      expect(onComplete).not.toHaveBeenCalled()
    })

    test('Should throw when documentId is empty', async () => {
      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              workspaceId: 'ws-123',
              documentId: '',
            },
            settings: {
              apiKey: 'test-api-key',
            },
          } as any,
          onComplete,
          onError,
          helpers,
          attempt: 1,
        }),
      ).rejects.toThrow()

      expect(onComplete).not.toHaveBeenCalled()
    })

    test('Should throw when apiKey is empty', async () => {
      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              workspaceId: 'ws-123',
              documentId: 'doc-456',
            },
            settings: {
              apiKey: '',
            },
          } as any,
          onComplete,
          onError,
          helpers,
          attempt: 1,
        }),
      ).rejects.toThrow()

      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
