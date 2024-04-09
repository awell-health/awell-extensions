import { responseMiddleware } from './graphqlClient'

const response = {
  // Type is a bit more complex, but `responseMiddleware` doesn't use that field
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  headers: {} as Headers,
  status: 200,
  data: {
    createTask: {
      task: null,
      messages: [
        {
          field: 'base',
          message: 'You do not have permission to create this task.',
        },
      ],
    },
  },
}

describe('responseMiddleware', () => {
  const responseMiddlewareMock = jest.fn(responseMiddleware)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should throw error when containing messages', async () => {
    expect(() => {
      responseMiddlewareMock(response)
    }).toThrowError(
      expect.objectContaining({
        name: 'HealthieError',
        message:
          'Error in Healthie: invalid object name or field, or a record is not found.',
        errors: [
          {
            field: 'base',
            message: 'You do not have permission to create this task.',
          },
        ],
      })
    )
  })

  test.each([{ messages: [] }, { messages: null }, { messages: undefined }])(
    '$#. Should NOT throw error when messages: $messages',
    async ({ messages }) => {
      expect(() => {
        responseMiddlewareMock({
          ...response,
          data: {
            ...response.data,
            createTask: { ...response.data.createTask, messages },
          },
        })
      }).not.toThrow()
    }
  )

  test.each([
    { response: null },
    { response: {} },
    { response: { data: {} } },
    { response: { data: { createTask: {} } } },
  ])(
    '$#. Should NOT throw error when response is malformed: $response',
    async ({ response }) => {
      expect(() => {
        // @ts-expect-error Needed to be able to put real-life scenario (actual data is malformed and not matching the type)
        responseMiddlewareMock(response)
      }).not.toThrow()
    }
  )
})
