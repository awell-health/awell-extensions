import { type MailDataRequired } from '../../sendgridSdk'
import { compose, map, split, trim, uniq } from 'lodash/fp'

export function getRecipientsFromCommaSeparatedEmails({
  commaSeparatedEmails,
}: {
  commaSeparatedEmails: string
}): MailDataRequired['to'] {
  const toEmailsRecipients = compose(
    uniq,
    map(trim),
    split(',')
  )(commaSeparatedEmails)

  return toEmailsRecipients
}
