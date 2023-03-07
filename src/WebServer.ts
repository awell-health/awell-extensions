import Fastify from 'fastify'
import { mapValues, omit } from 'lodash'
import { environment } from '../lib/environment'
import {
  type Field,
  type Setting,
  type Extension,
  type Action,
} from '../lib/types'
import { extensions } from '../extensions'

type ExtensionWebConfig = Omit<Extension, 'actions'> & {
  actions: Record<
    string,
    Omit<
      Action<
        Record<string, Field>,
        Record<string, Setting>
      >,
      'onActivityCreated'
    >
  >
}

const getExtensionConfig = (
  extension: Extension
): ExtensionWebConfig => {
  return {
    ...extension,
    actions: mapValues(extension.actions, (extension) =>
      omit(extension, 'onActivityCreated')
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
  const allExtensions = extensions.map((extension) =>
    getExtensionConfig(extension)
  )
  await reply.send(allExtensions)
})

webServer.get('/:extensionKey', async (request, reply) => {
  const { extensionKey } = request.params as { extensionKey: string }
  const extension = extensions.find(({ key }) => key === extensionKey)
  if (extension === undefined) {
    await reply.status(404)
  } else {
    await reply.send(getExtensionConfig(extension))
  }
})

export { webServer }
