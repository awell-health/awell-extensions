import { type MailgunMessageData } from 'mailgun.js/interfaces/Messages'

const mockSdk = {
  client: jest.fn((params) => {
    console.log('Calling mock Mailgun client function', params)

    return {
      messages: {
        create: jest.fn((domain: string, params: MailgunMessageData) => {
          console.log('Mocking Mailgun SDK call to messages.create', params)
        }),
      },
    }
  }),
}

export default mockSdk
