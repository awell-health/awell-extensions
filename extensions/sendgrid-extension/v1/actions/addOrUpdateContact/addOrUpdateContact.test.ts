import {
  SendgridClient,
  SendgridClientMockImplementation,
} from '../../../__mocks__/client'
import { addOrUpdateContact } from '..'
import { generateTestPayload } from '@/tests'
jest.mock('../../../client', () => ({ SendgridClient }))

describe('Add or update contact', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const successResponse = {
    body: {
      job_id: 'job_id',
    },
  }
  const basePayload = generateTestPayload({
    fields: {
      listIds: 'a1,b2',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      customFields: '{"name":"John Doe"}',
    },
    settings: {
      apiKey: 'apiKey',
      fromName: 'fromName',
      fromEmail: 'from@test.com',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback when Sendgrid sends a response with a status code of 202', async () => {
    SendgridClientMockImplementation.marketing.contacts.addOrUpdate.mockImplementationOnce(
      () => {
        return [successResponse, 'job_id']
      }
    )

    await addOrUpdateContact.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )

    expect(
      SendgridClientMockImplementation.marketing.contacts.addOrUpdate
    ).toHaveBeenCalledWith({
      listIds: ['a1', 'b2'],
      contacts: [
        {
          email: basePayload.fields.email,
          first_name: 'John',
          last_name: 'Doe',
          custom_fields: { name: 'John Doe' },
        },
      ],
    })
    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        jobId: 'job_id',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when the Sendgrid client throws an error', async () => {
    SendgridClientMockImplementation.marketing.contacts.addOrUpdate.mockImplementationOnce(
      () => {
        throw new Error('An error occurred')
      }
    )

    await addOrUpdateContact.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )
    expect(
      SendgridClientMockImplementation.marketing.contacts.addOrUpdate
    ).toHaveBeenCalledWith({
      listIds: ['a1', 'b2'],
      contacts: [
        {
          email: basePayload.fields.email,
          first_name: 'John',
          last_name: 'Doe',
          custom_fields: { name: 'John Doe' },
        },
      ],
    })

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
