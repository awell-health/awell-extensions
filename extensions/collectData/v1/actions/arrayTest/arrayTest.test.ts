

import { TestHelpers } from '@awell-health/extensions-core'
import { arrayTest } from './arrayTest'
import { generateTestPayload } from '../../../../../tests'


describe('arrayTest', () => {
  const { onComplete, onError, helpers, extensionAction } = TestHelpers.fromAction(arrayTest)

  test('should transform and stringify multi-select values', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          stringArray: 'two,three',
          numericArray: '1,3',
          anotherStringArray: 'option1,option2',
          anotherNumericArray: '50,51',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allStrings: '["two","three","option1","option2"]',
        allNumbers: '[1,3,50,51]',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})