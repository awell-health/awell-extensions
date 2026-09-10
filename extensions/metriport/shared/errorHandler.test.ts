import { AxiosError, type AxiosResponse } from 'axios'
import { handleErrorMessage } from './errorHandler'
import { NameLookupError } from './nameLookup'

const axiosError = (status: number, data: unknown): AxiosError =>
  new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    { status, data } as unknown as AxiosResponse,
  )

describe('handleErrorMessage', () => {
  test('reports a NameLookupError as WRONG_INPUT, since the care flow supplied a name Metriport does not know', async () => {
    const onError = jest.fn()

    await handleErrorMessage(
      new NameLookupError('No Cohort found with the name "Awell Clinic"'),
      onError,
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: { en: 'No Cohort found with the name "Awell Clinic"' },
          error: {
            category: 'WRONG_INPUT',
            message: 'No Cohort found with the name "Awell Clinic"',
          },
        }),
      ],
    })
  })

  test('reports the Metriport title and detail instead of the opaque Axios message', async () => {
    const onError = jest.fn()

    // Verbatim Metriport error body for a malformed facilityId.
    await handleErrorMessage(
      axiosError(400, {
        status: 400,
        title: 'Missing or invalid parameters',
        detail: 'Invalid uuid, on [facilityId]',
        name: 'Bad Request',
      }),
      onError,
    )

    const message =
      '400 Missing or invalid parameters: Invalid uuid, on [facilityId]'
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: { en: message },
          error: { category: 'SERVER_ERROR', message },
        }),
      ],
    })
  })

  test('reports the detail alone when the body has no title', async () => {
    const onError = jest.fn()

    await handleErrorMessage(
      axiosError(404, { status: 404, detail: 'Could not find patient' }),
      onError,
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: { en: '404 Error: Could not find patient' },
        }),
      ],
    })
  })

  test('reports the title alone when the body has no detail', async () => {
    const onError = jest.fn()

    await handleErrorMessage(
      axiosError(403, { status: 403, title: 'Forbidden' }),
      onError,
    )

    expect(onError).toHaveBeenCalledWith({
      events: [expect.objectContaining({ text: { en: '403 Forbidden' } })],
    })
  })

  test.each([
    ['no response body', undefined],
    ['a body without detail', { status: 500, name: 'InternalServerError' }],
    ['empty title and detail', { title: '', detail: '' }],
    ['a non-string detail', { detail: { nested: true } }],
  ])(
    'falls back to the Axios message when there is %s',
    async (_label, data) => {
      const onError = jest.fn()

      await handleErrorMessage(axiosError(500, data), onError)

      const message = '500 Error: Request failed with status code 500'
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            text: { en: message },
            error: { category: 'SERVER_ERROR', message },
          }),
        ],
      })
    },
  )
})
