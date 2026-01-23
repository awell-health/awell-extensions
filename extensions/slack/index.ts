import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { sendMessageToChannel } from './v1/actions'
import { settings } from './settings'

export const Slack: Extension = {
  key: 'slack',
  title: 'Slack',
  icon_url:
    'https://res.cloudinary.com/dre4xxcrk/image/upload/v1769185115/Slack_icon_2019_jr0cmr.svg',
  description:
    'Send messages to Slack channels from your care flows to keep your team informed.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    sendMessageToChannel,
  },
}
