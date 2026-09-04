import { handleErrorMessage } from './errorHandler'
import { NameLookupError } from './nameLookup'

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
})
