import { generateTestPayload } from '@/tests'
import { remoteSingleSelect } from './remoteSingleSelect'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await remoteSingleSelect.onActivityCreated!(
      generateTestPayload({
        fields: {
          headers: '{"Content-Type": "application/json"}',
          queryParam: 'search',
          url: 'https://example.com',
          label: 'label',
          mandatory: true,
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
