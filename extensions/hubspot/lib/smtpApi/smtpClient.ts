import * as nodemailer from 'nodemailer'
import { type SendEmailType } from './smtp.schema'

interface HubSpotSMTPClientOptions {
  username: string
  password: string
}

export class HubSpotSMTPClient {
  private readonly username: string
  private readonly password: string

  public constructor(options: HubSpotSMTPClientOptions) {
    this.username = options.username
    this.password = options.password
  }

  public async sendEmail(input: SendEmailType): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.hubapi.com',
        port: 587,
        secure: false,
        auth: {
          user: this.username,
          pass: this.password,
        },
      })

      const mailOptions = {
        from: input.from,
        to: input.to,
        subject: input.subject,
        text: input.message,
      }

      await transporter.sendMail(mailOptions)
    } catch (error) {
      const typedError = error as Error
      throw new Error(typedError?.message)
    }
  }
}
