import { generateTestPayload } from '../../../../src/tests'
import {
  WellinksClient,
  WellinksClientMockImplementation,
} from '../../api/clients/__mocks__/wellinksClient'
import { mockSettings } from '../../__mocks__/config/settings'
import { insertMemberListEvent } from './insertMemberListEvent'

jest.mock('../../api/clients/wellinksClient', () => ({ WellinksClient }))

describe('Insert Member List Event', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call onComplete with a true DataPoints when the wellinksClient gets a 201 response', async () => {
    const validPayload = generateTestPayload({
      fields: {
        eventName: 'event-name',
        memberId: 'memberId',
        sourceName: 'source-name',
        sendgridListId: 'sendgrid-list-id',
        originatorName: 'originator-name',
        eventDate: '10-10-2020',
        lockedById: 'locked-by-id',
      },
      settings: mockSettings,
    })

    WellinksClientMockImplementation.memberListEvent.insert.mockImplementationOnce(
      () => {
        return 201
      }
    )

    await insertMemberListEvent.onActivityCreated(
      validPayload,
      onComplete,
      onError
    )

    expect(onError).not.toBeCalled()
    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        insertSuccessful: 'true',
      },
    })
  })

  test('should call onComplete with a false DataPoint when the wellinksClient gets a non-201 response', async () => {
    const validPayload = generateTestPayload({
      fields: {
        eventName: 'event-name',
        memberId: 'memberId',
        sourceName: 'source-name',
        sendgridListId: 'sendgrid-list-id',
        originatorName: 'originator-name',
        eventDate: '10-10-2020',
        lockedById: 'locked-by-id',
      },
      settings: mockSettings,
    })

    WellinksClientMockImplementation.memberListEvent.insert.mockImplementationOnce(
      () => {
        return 500
      }
    )

    await insertMemberListEvent.onActivityCreated(
      validPayload,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        insertSuccessful: 'false',
      },
    })
    expect(onError).not.toBeCalled()
  })

  test('should call onError if any of the required arguments are undefined/empty', async () => {
    const invalidPayload = generateTestPayload({
      fields: {
        eventName: 'event-name',
        memberId: undefined,
        sourceName: 'source-name',
        sendgridListId: 'sendgrid-list-id',
        originatorName: 'originator-name',
        eventDate: '10-10-2020',
        lockedById: 'locked-by-id',
      },
      settings: mockSettings,
    })

    await insertMemberListEvent.onActivityCreated(
      invalidPayload,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenNthCalledWith(1, {
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: 'The memberId field is required',
          },
        }),
      ]),
    })
    expect(onComplete).not.toBeCalled()
  })

  test('should call onComplete even if the non-required arguments are undefined/empty', async () => {
    const invalidPayload = generateTestPayload({
      fields: {
        eventName: 'event-name',
        memberId: 'member-id',
        sourceName: 'source-name',
        sendgridListId: 'sendgrid-list-id',
        originatorName: 'originator-name',
        eventDate: '10-10-2020',
        lockedById: undefined,
      },
      settings: mockSettings,
    })
    WellinksClientMockImplementation.memberListEvent.insert.mockImplementationOnce(
      () => {
        return 201
      }
    )
    await insertMemberListEvent.onActivityCreated(
      invalidPayload,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        insertSuccessful: 'true',
      },
    })
    expect(onError).not.toBeCalled()
  })

  test('should call onError if the WellinksClient throws an error', async () => {
    const invalidPayload = generateTestPayload({
      fields: {
        eventName: 'event-name',
        memberId: 'member-id',
        sourceName: 'source-name',
        sendgridListId: 'sendgrid-list-id',
        originatorName: 'originator-name',
        eventDate: '10-10-2020',
        lockedById: 'locked-by-id',
      },
      settings: mockSettings,
    })
    WellinksClientMockImplementation.memberListEvent.insert.mockImplementationOnce(
      () => {
        throw new Error('AN ERROR HAS OCCURRED')
      }
    )
    await insertMemberListEvent.onActivityCreated(
      invalidPayload,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenNthCalledWith(1, {
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message:
              'an error occurred while trying to insert a MemberListEvent',
          },
        }),
      ]),
    })
    expect(onComplete).not.toBeCalled()
  })
})
