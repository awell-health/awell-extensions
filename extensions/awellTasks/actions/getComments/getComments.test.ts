import { TestHelpers } from '@awell-health/extensions-core'
import { TasksApiClient } from '../../api/client'
import { getComments as action } from './getComments'
import { commentsMock } from './__testdata__/comments.mock'

jest.mock('../../api/client', () => ({
  TasksApiClient: jest.fn().mockImplementation(() => ({
    getCareflowComments: jest.fn().mockResolvedValue({
      data: commentsMock,
    }),
  })),
}))

const mockedSdk = jest.mocked(TasksApiClient)

describe('Task Service - Get care flow comments', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {},
        pathway: {
          id: 'pathway-id',
        },
        settings: {
          baseUrl: 'https://api.awellhealth.com',
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        comments: `Author: nick@awellhealth.com
Date: January 10, 2025

Cool stuff

-------------------

Author: nick@awellhealth.com
Date: January 10, 2025

fdksfdsfdksfjmdsfdsfkdsjfkmdsfds

jfdksmfjkmdsjds

jdmfjkdmsfkdsjmfkdsfsdfdskjfmdsjfkmdsjfdsjfds$jfds

-------------------

Author: nick@awellhealth.com
Date: January 10, 2025

Test


- List
- List
- List

Hello world

More

More

More

-------------------

Author: nick@awellhealth.com
Date: January 10, 2025

Test


- List
- List
- List

Hello world

-------------------

Author: nick@awellhealth.com
Date: January 10, 2025

fdsfd

-------------------
`,
      },
    })
  })
})
