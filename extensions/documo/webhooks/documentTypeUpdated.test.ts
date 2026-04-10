import { TestHelpers } from '@awell-health/extensions-core'
import { documentTypeUpdated as webhook } from './documentTypeUpdated'
import {
  fullPayload,
  alternateTypePayload,
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
          documentId: '39960bdb-c1c8-464d-bbb0-343e6be551bf',
          workspaceId: '41da08f1-f736-479e-a146-4ade8888fff9',
          typeName: 'Other',
          typeId: '6d3ad756-7e43-43a7-ab4b-0af67ab2ba44',
          userEmail: 'jonathan@awellhealth.com',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When payload has a different type', () => {
    it('should extract data points correctly', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: alternateTypePayload,
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
          webhookData: JSON.stringify(alternateTypePayload),
          documentId: '22222222-2222-2222-2222-222222222222',
          workspaceId: '41da08f1-f736-479e-a146-4ade8888fff9',
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

      expect(webhookData.accountId).toBe(fullPayload.accountId)
      expect(webhookData.workspaceId).toBe(fullPayload.workspaceId)
      expect(webhookData.documentId).toBe(fullPayload.documentId)
      expect(webhookData.type).toEqual(fullPayload.type)
      expect(webhookData.user).toEqual(fullPayload.user)
    })
  })
})
