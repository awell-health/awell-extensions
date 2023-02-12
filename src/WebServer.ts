import Fastify from 'fastify'
import { mapValues, omit } from 'lodash'
import { environment } from '../lib/environment'
import {
  type PluginActionField,
  type PluginSetting,
  type ActivityPlugin,
  type PluginAction,
} from '../lib/types'
import { plugins } from '../plugins'

type ActivityPluginConfig = Omit<ActivityPlugin, 'actions'> & {
  actions: Record<
    string,
    Omit<
      PluginAction<
        Record<string, PluginActionField>,
        Record<string, PluginSetting>
      >,
      'onActivityCreated'
    >
  >
}

const getPluginConfig = (plugin: ActivityPlugin): ActivityPluginConfig => {
  return {
    ...plugin,
    actions: mapValues(plugin.actions, (action) =>
      omit(action, 'onActivityCreated')
    ),
  }
}

const webServer = Fastify({
  logger: {
    transport: environment.PRETTY_LOGS
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
    level: environment.LOG_LEVEL,
  },
})

webServer.get('/', async (request, reply) => {
  const allPlugins = plugins.map((plugin) => getPluginConfig(plugin))
  await reply.send(allPlugins)
})

webServer.get('/:pluginKey', async (request, reply) => {
  const { pluginKey } = request.params as { pluginKey: string }
  const plugin = plugins.find(({ key }) => key === pluginKey)
  if (plugin === undefined) {
    await reply.status(404)
  } else {
    await reply.send(getPluginConfig(plugin))
  }
})

export { webServer }
