import {
  SendgridClient,
  SendgridClientMockImplementation,
  mockActionPayload,
} from '../../../__mocks__/client/sendgridClient'
import { removeSuppressions } from './removeSuppressions'
jest.mock('../../../client', () => ({ SendgridClient }))

describe('Remove Suppressions', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = mockActionPayload<(typeof removeSuppressions)['fields']>({
    fields: {
      email: 'test-email@email.com',
      groups: '12345, 123456',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls onComplete when Sendgrid sends a non-error response', async () => {
    await removeSuppressions.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )
    expect(
      SendgridClientMockImplementation.groups.suppressions.remove
    ).toHaveBeenNthCalledWith(1, '12345', 'test-email@email.com')
    expect(
      SendgridClientMockImplementation.groups.suppressions.remove
    ).toHaveBeenNthCalledWith(2, '123456', 'test-email@email.com')

    expect(onComplete).toBeCalledTimes(1)
  })

  test('calls onError when an error code is sent from sendgrid', async () => {
    SendgridClientMockImplementation.groups.suppressions.remove.mockImplementationOnce(
      () => {
        throw new Error('hiya')
      }
    )
    await removeSuppressions.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )
    expect(onComplete).not.toBeCalled()
    expect(onError).toHaveBeenNthCalledWith(1, {
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: 'hiya',
          },
        }),
      ]),
    })
  })
})
