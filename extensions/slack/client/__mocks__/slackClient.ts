export const mockPostMessage = jest.fn().mockResolvedValue({
  ok: true,
  ts: '1234567890.123456',
  channel: 'C1234567890',
})

export const SlackClient = jest.fn().mockImplementation(() => ({
  postMessage: mockPostMessage,
}))

export const isSlackErrorResponse = jest.fn().mockReturnValue(false)

export const mapSlackErrorToActivityEvent = jest.fn().mockReturnValue({
  date: new Date().toISOString(),
  text: { en: 'Slack error' },
  error: {
    category: 'SERVER_ERROR',
    message: 'Slack error',
  },
})
