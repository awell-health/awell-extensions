import { FieldsValidationSchema } from './config'

describe('Redirect action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Action fields validation validation work', async () => {
    expect(() => {
      FieldsValidationSchema.parse({
        redirectUrl: 'url',
        redirectMessage: 'message',
      })
    }).not.toThrow()
  })
})
