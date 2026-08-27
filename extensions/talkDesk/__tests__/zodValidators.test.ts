import { SettingsValidationSchema } from '../settings'
import { FieldsValidationSchema } from '../actions/triggerFlow/config/fields'

describe('talkDesk .default() sites (zod 4)', () => {
  describe('SettingsValidationSchema.region', () => {
    const base = {
      talkDeskAccountName: 'acme',
      clientId: 'id',
      clientSecret: 'secret',
    }

    it('defaults to US when undefined', () => {
      expect(SettingsValidationSchema.parse(base).region).toBe('US')
    })

    it.each(['US', 'EU', 'Canada'])('keeps explicit region %s', (region) => {
      expect(SettingsValidationSchema.parse({ ...base, region }).region).toBe(
        region,
      )
    })

    it('rejects an empty-string region (default applies to undefined only)', () => {
      const result = SettingsValidationSchema.safeParse({ ...base, region: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]).toMatchObject({
        code: 'invalid_value',
        path: ['region'],
      })
    })
  })

  describe('FieldsValidationSchema.autoComplete', () => {
    const base = { flowId: 'flow', data: '{"awell_activity_id":"a1"}' }

    it('defaults to false when undefined', () => {
      const result = FieldsValidationSchema.parse(base)
      expect(result.autoComplete).toBe(false)
      expect(result.data).toEqual({ awell_activity_id: 'a1' })
    })

    it('keeps an explicit true', () => {
      expect(
        FieldsValidationSchema.parse({ ...base, autoComplete: true })
          .autoComplete,
      ).toBe(true)
    })

    it('treats empty data as an empty object', () => {
      expect(FieldsValidationSchema.parse({ ...base, data: '' }).data).toEqual(
        {},
      )
    })

    it('rejects non-string data values', () => {
      const result = FieldsValidationSchema.safeParse({
        ...base,
        data: '{"n":1}',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(
        'Value for key "n" must be a string',
      )
    })
  })
})
