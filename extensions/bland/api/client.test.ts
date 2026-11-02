import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { BlandApiClient } from './client'

const clientFailingWith = (
  makeError: (config: InternalAxiosRequestConfig) => Error,
): BlandApiClient => {
  const sdk = new BlandApiClient({
    baseUrl: 'https://api.bland.ai/v1',
    apiKey: 'key',
  })
  // @ts-expect-error reaching into the private axios instance to stub the network
  sdk.client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw makeError(config)
  }
  return sdk
}

const httpError =
  (status: number, data: unknown) => (config: InternalAxiosRequestConfig) =>
    new AxiosError(
      `Request failed with status code ${status}`,
      'ERR_BAD_REQUEST',
      config,
      null,
      { status, statusText: '', headers: {}, config, data },
    )

describe('BlandApiClient errors', () => {
  test('puts the status and Bland response body in the error message', async () => {
    const body = {
      status: 'error',
      message: 'Invalid parameters',
      errors: ['bad start_time'],
    }
    const sdk = clientFailingWith(httpError(400, body))

    await expect(
      sdk.sendCall({ phone_number: '+15555555555', task: 't' }),
    ).rejects.toThrow(
      `Bland API POST /calls failed with status 400: ${JSON.stringify(body)}`,
    )
  })

  test('caps a long non-JSON body at 500 characters', async () => {
    const html = `<html>${'x'.repeat(1000)}</html>`
    const sdk = clientFailingWith(httpError(502, html))

    const err = await sdk.getCallDetails({ call_id: 'abc' }).catch((e) => e)

    expect(err.message).toBe(
      `Bland API GET /calls/abc failed with status 502: ${html.slice(0, 500)}`,
    )
  })

  test('leaves errors without a response untouched', async () => {
    const sdk = clientFailingWith(
      (config) =>
        new AxiosError('connect ECONNREFUSED', 'ECONNREFUSED', config),
    )

    const err = await sdk.getCallDetails({ call_id: 'abc' }).catch((e) => e)

    expect(err.message).toBe('connect ECONNREFUSED')
    expect(err.code).toBe('ECONNREFUSED')
  })
})
