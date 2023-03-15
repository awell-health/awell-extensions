import { type MailDataRequired } from '../../sendgridSdk'
import { isEmpty, isNil } from 'lodash'

export function getReplyTo({
  fromEmail,
  fromName,
  replyToEmail,
  replyToName,
}: {
  fromEmail: string
  fromName?: string
  replyToEmail?: string
  replyToName?: string
}): MailDataRequired['replyTo'] {
  if (isNil(replyToEmail) || isEmpty(replyToEmail)) {
    return { name: fromName, email: fromEmail }
  }
  return { name: replyToName, email: replyToEmail }
}
