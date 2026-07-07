import {
  setRegistry,
  listExtensions,
  findExtension,
  findAction,
  findWebhook,
  type Extension,
} from './registry'

// Minimal fakes — the lookups only touch key/actions/webhooks, so we cast partial
// objects rather than construct full Extension instances.
const demo = {
  key: 'demo',
  actions: { doThing: { key: 'doThing' } },
  webhooks: [{ key: 'thingHappened' }],
} as unknown as Extension

describe('registry (injected via setRegistry)', () => {
  beforeEach(() => {
    setRegistry([demo])
  })

  it('listExtensions returns the injected registry', () => {
    expect(listExtensions()).toEqual([demo])
  })

  it('findExtension resolves by key, undefined for unknown', () => {
    expect(findExtension('demo')).toBe(demo)
    expect(findExtension('nope')).toBeUndefined()
  })

  it('findAction resolves an action within an extension', () => {
    expect(findAction('demo', 'doThing')?.key).toBe('doThing')
    expect(findAction('demo', 'missing')).toBeUndefined()
    expect(findAction('nope', 'doThing')).toBeUndefined()
  })

  it('findWebhook resolves a webhook within an extension', () => {
    expect(findWebhook('demo', 'thingHappened')?.key).toBe('thingHappened')
    expect(findWebhook('demo', 'missing')).toBeUndefined()
  })

  it('setRegistry replaces the registry', () => {
    setRegistry([])
    expect(listExtensions()).toEqual([])
    expect(findExtension('demo')).toBeUndefined()
  })
})
