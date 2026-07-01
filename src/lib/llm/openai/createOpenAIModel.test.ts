import { createOpenAIModel } from './createOpenAIModel'
import { MODEL_VERSIONS, OPENAI_MODELS } from './constants'

const buildArgs = (
  overrides: Record<string, unknown> = {},
): Parameters<typeof createOpenAIModel>[0] => ({
  settings: {},
  helpers: {
    getOpenAIConfig: () => ({ apiKey: 'env-api-key' }),
  },
  payload: {
    pathway: {
      id: 'pathway-1',
      definition_id: 'def-1',
      tenant_id: 'tenant-1',
      org_slug: 'org-slug',
      org_id: 'org-1',
    },
    activity: { id: 'activity-1' },
  },
  ...overrides,
})

describe('createOpenAIModel', () => {
  it('applies the model defaults from getDefaultConfig', async () => {
    const { model } = await createOpenAIModel(buildArgs())

    expect(model.model).toBe(MODEL_VERSIONS[OPENAI_MODELS.GPT5Mini])
    // Raised from 30s to 60s to give gpt-5-mini reasoning latency headroom
    expect(model.timeout).toBe(60000)
    // No reasoning override by default -> preserves the model's default quality
    expect(model.reasoning).toBeUndefined()
  })

  it('merges modelConfigOverrides on top of the defaults', async () => {
    const { model } = await createOpenAIModel(
      buildArgs({ modelConfigOverrides: { reasoning: { effort: 'low' } } }),
    )

    expect(model.reasoning).toEqual({ effort: 'low' })
    // Untouched defaults still apply
    expect(model.timeout).toBe(60000)
  })

  it('does not allow overrides to change the enforced model or apiKey', async () => {
    const { model } = await createOpenAIModel(
      buildArgs({
        settings: { openAiApiKey: 'settings-api-key' },
        modelConfigOverrides: {
          model: 'gpt-4o',
          apiKey: 'hijacked-key',
          reasoning: { effort: 'low' },
        },
      }),
    )

    expect(model.model).toBe(MODEL_VERSIONS[OPENAI_MODELS.GPT5Mini])
    expect(model.apiKey).toBe('settings-api-key')
    expect(model.reasoning).toEqual({ effort: 'low' })
  })

  it('throws when no API key is available', async () => {
    await expect(
      createOpenAIModel(
        buildArgs({
          helpers: { getOpenAIConfig: () => ({ apiKey: undefined }) },
        }),
      ),
    ).rejects.toThrow('No OpenAI API key available')
  })
})
