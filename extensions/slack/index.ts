import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { sendMessageToChannel } from './v1/actions'
import { settings } from './settings'

export const Slack: Extension = {
  key: 'slack',
  title: 'Slack',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/slack-icon.svg',
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
