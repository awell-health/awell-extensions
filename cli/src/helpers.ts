import https from 'https'
import type { Helpers, LogError } from '@awell-health/extensions-core'

const notSupported = (name: string): never => {
  throw new Error(
    `helpers.${name} is not available in the local CLI. This action cannot be run locally.`,
  )
}

export const createHelpers = (): Helpers => ({
  httpsAgent: (opts) => new https.Agent(opts),
  awellSdk: async () => notSupported('awellSdk'),
  getOpenAIConfig: () => {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey === undefined || apiKey === '') {
      throw new Error('OPENAI_API_KEY is not set in .env')
    }
    return { apiKey, temperature: 0, maxRetries: 3, timeout: 30000 }
  },
  getLangSmithConfig: () => {
    const apiKey = process.env.LANGSMITH_API_KEY ?? ''
    return {
      tracing: process.env.LANGSMITH_TRACING === 'true',
      endpoint: process.env.LANGSMITH_ENDPOINT ?? '',
      apiKey,
      project: process.env.LANGSMITH_PROJECT ?? '',
    }
  },
  rateLimiter: () => ({
    limit: async () => ({
      success: true,
      result: {
        remainingPoints: 0,
        msBeforeNext: 0,
        consumedPoints: 0,
        isFirstInDuration: false,
      } as any,
    }),
    reset: async () => undefined,
  }),
  openAIModelConfig: async () => notSupported('openAIModelConfig'),
  log: (
    data: Record<string, unknown>,
    message: string,
    error?: LogError | Error,
  ) => {
    if (error !== undefined) {
      process.stderr.write(
        `[log] ${message} ${JSON.stringify(data)} ${String(error)}\n`,
      )
    } else {
      process.stderr.write(`[log] ${message} ${JSON.stringify(data)}\n`)
    }
  },
})
