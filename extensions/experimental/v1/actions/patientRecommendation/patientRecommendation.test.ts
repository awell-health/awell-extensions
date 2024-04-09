import { FieldsValidationSchema } from './config'

describe('Patient recommendation action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Action fields validation validation work', async () => {
    expect(() => {
      FieldsValidationSchema.parse({
        title: 'title',
        message: 'message',
        acceptRecommendationButtonLabel: 'Button label',
        acceptRecommendationDeepLink: 'https://www.test.com',
        discardRecommendationButtonLabel: 'Button label',
      })
    }).not.toThrow()
  })
})
