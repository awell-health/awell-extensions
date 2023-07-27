import {
  mockActionPayload,
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { importStatus } from './importStatus'
import { type Response } from '@sendgrid/helpers/classes'

jest.mock('../../../client', () => ({ SendgridClient }))

describe('Import Status', () => {
  const successResponse: Response = {
    statusCode: 200,
    headers: {},
    body: {
      status: 'done',
      finishedAt: '10-10-2020',
    },
  }
  const onComplete = jest.fn()
  const onError = jest.fn()
  const basePayload = mockActionPayload<(typeof importStatus)['fields']>({
    fields: {
      jobId: 'jobId',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call onComplete callback when Sendgrid returns a 200 status response', async () => {
    SendgridClientMockImplementation.marketing.contacts.importStatus.mockImplementationOnce(
      () => {
        return [successResponse, 'status']
      }
    )
    await importStatus.onActivityCreated(basePayload, onComplete, onError)

    expect(
      SendgridClientMockImplementation.marketing.contacts.importStatus
    ).toHaveBeenCalledWith('jobId')

    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        importStatus: 'done',
        finishedAt: '10-10-2020',
      },
    })
    expect(onError).not.toBeCalled()
  })

  test('Should call onError callback when Sendgrid Client throws an error', async () => {
    SendgridClientMockImplementation.marketing.contacts.importStatus.mockImplementationOnce(
      () => {
        throw new Error('An error occurred')
      }
    )
    await importStatus.onActivityCreated(basePayload, onComplete, onError)
    expect(onComplete).not.toBeCalled()
    expect(onError).toHaveBeenNthCalledWith(1, {
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: 'An error occurred',
          },
        }),
      ]),
    })
  })
})
