import { createTicket } from './createTicket'
import { generateTestPayload } from '@/tests'

describe('Create ticket', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should create a ticket with required fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      access_token: 'test-access-token',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
    }

    const payload = generateTestPayload({
      fields: mockFields,
      settings: mockSettings,
    })

    await createTicket.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        ticketId: expect.any(String),
        ticketUrl: expect.stringContaining('test-company.zendesk.com'),
      }),
    })
  })

  test('Should create a ticket with all optional fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      access_token: 'test-access-token',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
      group_id: '123',
      priority: 'high',
      external_id: 'ext-123',
      tag: 'urgent',
    }

    const payload = generateTestPayload({
      fields: mockFields,
      settings: mockSettings,
    })

    await createTicket.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        ticketId: expect.any(String),
        ticketUrl: expect.stringContaining('test-company.zendesk.com'),
      }),
    })
  })
})
