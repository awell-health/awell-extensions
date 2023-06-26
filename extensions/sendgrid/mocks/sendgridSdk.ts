import { type MailService } from '@sendgrid/mail'

export const sendgridSdkMock =
  jest.createMockFromModule<MailService>('@sendgrid/mail')
