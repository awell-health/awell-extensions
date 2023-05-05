import { createLightship } from 'lightship'
import {
  ExtensionActivityServer,
  // ExtensionWebhookServer,
} from './ExtensionServer'
import { extensions } from '../extensions'
import { webServer } from './WebServer'
import { environment } from '../lib/environment'

const start = async (): Promise<void> => {
  const lightship = await createLightship()
  const log = webServer.log
  const extensionActivityServer = new ExtensionActivityServer({
    log,
  })
  lightship.registerShutdownHandler(async () => {
    log.info('Shutting down extension activities server')
    await extensionActivityServer.shutDown()
    log.info('Shutting down web server')
    await webServer.close()
  })
  try {
    await webServer.listen({ port: environment.PORT, host: '::' })
    log.info('Initialising extension activities server')
    await extensionActivityServer.init()
    await extensions.reduce(async (register, extension) => {
      await register
      await extensionActivityServer.registerExtensionActivities(extension)
    }, Promise.resolve())
    log.info('Extension activity registration completed successfully')
    lightship.signalReady()
  } catch (err) {
    log.fatal(err, 'Extension server failed to start')
    await lightship.shutdown()
    process.exit(-1)
  }
}

void start()
