import { generateTestPayload } from '../../../../src/tests'
import {
  WellinksFlourishClientMockImplementation,
  WellinksFlourishClient,
} from '../../api/clients/__mocks__/wellinksFlourishClient'
import { mockSettings } from '../../__mocks__/config/settings'
import { createFlourishCustomer } from './createFlourishCustomer'
import { ZodError } from 'zod'

jest.mock('../../api/clients/wellinksFlourishClient', () => ({
  WellinksFlourishClient,
}))

describe('Create Flourish User', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should throw a ZodError when the payload is invalid', async () => {
    const invalidPayload = generateTestPayload({
      fields: {
        firstName: undefined,
        lastName: undefined,
        dateOfBirth: undefined,
        subgroupId: undefined,
        thirdPartyIdentifier: undefined,
      },
      settings: mockSettings,
    })

    await expect(
      createFlourishCustomer.onActivityCreated(
        invalidPayload,
        onComplete,
        onError
      )
    ).rejects.toThrowError(ZodError)
  })

  test('should call onComplete with a dataPoint boolean value equal to the return from the client', async () => {
    const validPayload = generateTestPayload({
      fields: {
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: '2020-01-01T00:00:00Z',
        subgroupId: '1234',
        thirdPartyIdentifier: '1234',
      },
      settings: mockSettings,
    })
    WellinksFlourishClientMockImplementation.user.create.mockImplementationOnce(
      () => {
        return true
      }
    )

    await createFlourishCustomer.onActivityCreated(
      validPayload,
      onComplete,
      onError
    )
    expect(onError).not.toBeCalled()
    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        createSuccessful: 'true',
      },
    })
  })
})
