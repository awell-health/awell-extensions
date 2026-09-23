import axios from 'axios'
import FormData from 'form-data'
import { InfobipClient } from './client'

jest.mock('axios')
const postMock = axios.post as unknown as jest.Mock

describe('InfobipClient.emailApi.send', () => {
  beforeEach(() => {
    postMock.mockReset()
    postMock.mockResolvedValue({ data: { bulkId: 'b', messages: [] } })
  })

  const client = new InfobipClient({
    baseUrl: 'https://example.api.com',
    apiToken: 'token',
  })

  test('appends text fields as strings and the attachment as a binary part', async () => {
    const data = Buffer.from('%PDF-1.4 hello')

    await client.emailApi.send({
      from: 'from@example.com',
      to: ['to@example.com'],
      subject: 'Hi',
      html: '<p>Hi</p>',
      attachment: { filename: 'Report.pdf', data, contentType: 'application/pdf' },
    })

    expect(postMock).toHaveBeenCalledTimes(1)
    const [url, body, config] = postMock.mock.calls[0] as [string, FormData, { headers: Record<string, string> }]
    expect(url).toBe('https://example.api.com/email/3/send')
    expect(config.headers.Authorization).toBe('App token')
    expect(body).toBeInstanceOf(FormData)

    const raw = body.getBuffer().toString('latin1')
    expect(raw).toContain('name="to"\r\n\r\nto@example.com')
    expect(raw).toContain('name="html"\r\n\r\n<p>Hi</p>')
    expect(raw).toContain('name="attachment"; filename="Report.pdf"')
    expect(raw).toContain('Content-Type: application/pdf')
    expect(raw).toContain('%PDF-1.4 hello')
    // the attachment object itself must never be stringified into the form
    expect(raw).not.toContain('[object Object]')
  })

  test('omits the attachment part when none is provided', async () => {
    await client.emailApi.send({
      from: 'from@example.com',
      to: ['to@example.com'],
      subject: 'Hi',
      html: '<p>Hi</p>',
    })

    const body = postMock.mock.calls[0][1] as FormData
    expect(body.getBuffer().toString('latin1')).not.toContain('name="attachment"')
  })
})
