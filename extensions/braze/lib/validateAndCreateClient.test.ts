import { generateTestPayload } from '../../../tests/constants'
import { validateAndCreateClient } from './validateAndCreateClient'
import { z } from 'zod'

describe('Braze - validateAndCreateClient', () => {
  describe('If app id is only provided via settings', () => {
    it('should use the app id from settings', async () => {
      const payload = generateTestPayload({
        fields: {
          appId: '',
        },
        settings: {
          appId: 'settings-appId',
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
        },
      })

      const result = await validateAndCreateClient({
        fieldsSchema: z.unknown(),
        payload,
      })

      expect(result.appId).toBe('settings-appId')
    })
  })

  describe('If app id is only provided via fields', () => {
    it('should use the app id from fields', async () => {
      const payload = generateTestPayload({
        fields: {
          appId: 'fields-appId',
        },
        settings: {
          appId: undefined,
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
        },
      })

      const result = await validateAndCreateClient({
        fieldsSchema: z.unknown(),
        payload,
      })

      expect(result.appId).toBe('fields-appId')
    })
  })

  describe('If app id is provided via both settings and fields', () => {
    it('should use the app id from fields', async () => {
      const payload = generateTestPayload({
        fields: {
          appId: 'fields-appId',
        },
        settings: {
          appId: 'settings-appId',
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
        },
      })

      const result = await validateAndCreateClient({
        fieldsSchema: z.unknown(),
        payload,
      })

      expect(result.appId).toBe('fields-appId')
    })
  })

  describe('If app id is not provided via settings or fields', () => {
    it('should throw an error', async () => {
      const payload = generateTestPayload({
        fields: {
          appId: undefined,
        },
        settings: {
          appId: undefined,
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
        },
      })

      await expect(
        validateAndCreateClient({
          fieldsSchema: z.unknown(),
          payload,
        }),
      ).rejects.toThrow(
        'App ID is required. Either provide it via the extension settings or the action field.',
      )
    })
  })

  describe('If app id is not provided via settings or fields and requiresAppId is false', () => {
    it('should not throw an error', async () => {
      const payload = generateTestPayload({
        fields: {
          appId: undefined,
        },
        settings: {
          appId: undefined,
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
        },
      })

      await expect(
        validateAndCreateClient({
          fieldsSchema: z.unknown(),
          payload,
          requiresAppId: false,
        }),
      ).resolves.not.toThrow()
    })
  })
})
