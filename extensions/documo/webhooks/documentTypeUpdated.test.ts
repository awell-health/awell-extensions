import { TestHelpers } from '@awell-health/extensions-core'
import { documentTypeUpdated as webhook } from './documentTypeUpdated'
import {
  fullPayload,
  minimalPayload,
  withoutUserPayload,
} from './__testdata__/documentTypeUpdated.mock'

describe('Documo - Webhook - Document Type Updated', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload has all fields populated', () => {
    it('should extract all data points correctly', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: fullPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(fullPayload),
          documentId: '22222222-2222-2222-2222-222222222222',
          workspaceId: '00000000-0000-0000-0000-000000000000',
          documentName: 'patient-intake-form.pdf',
          sourceType: 'fax',
          typeName: 'admission form',
          typeId: '33333333-3333-3333-3333-333333333333',
          userEmail: 'admin@example.com',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has minimal/nullable fields', () => {
    it('should extract data points with defaults for missing fields', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: minimalPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          webhookData: JSON.stringify(minimalPayload),
          documentId: '22222222-2222-2222-2222-222222222222',
          workspaceId: '00000000-0000-0000-0000-000000000000',
          documentName: 'minimal-doc.pdf',
          sourceType: 'upload',
          typeName: 'admission form',
          typeId: '33333333-3333-3333-3333-333333333333',
          userEmail: 'admin@example.com',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has no user (invalid per schema)', () => {
    it('should throw a ZodError during parsing', async () => {
      await expect(
        extensionWebhook.onEvent!({
          payload: {
            payload: withoutUserPayload,
            settings: {},
            rawBody: Buffer.from(''),
            headers: {},
          },
          onSuccess,
          onError,
          helpers,
        }),
      ).rejects.toThrow()

      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('webhookData data point', () => {
    it('should always include the full payload as JSON', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: fullPayload,
          settings: {},
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      const callArgs = onSuccess.mock.calls[0][0]
      const webhookData = JSON.parse(callArgs.data_points.webhookData)

      expect(webhookData.workspace).toEqual(fullPayload.workspace)
      expect(webhookData.document).toEqual(fullPayload.document)
      expect(webhookData.type).toEqual(fullPayload.type)
      expect(webhookData.user).toEqual(fullPayload.user)
    })
  })
})
