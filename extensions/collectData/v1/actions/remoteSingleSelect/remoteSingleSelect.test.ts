import { generateTestPayload } from '../../../../../src/tests'
import { remoteSingleSelect } from './remoteSingleSelect'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await remoteSingleSelect.onActivityCreated(
      generateTestPayload({
        fields: {
          optionsSourceHeaders: '{"Content-Type": "application/json"}',
          optionsSourceQueryParams: 'search',
          optionsSourceUrl: 'https://example.com',
          questionLabel: 'label',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )

    /**
     * Because completion is done in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
  })
})
