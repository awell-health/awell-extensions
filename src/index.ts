import { createLightship } from 'lightship'
import { ExtensionServer } from './ExtensionServer'
import { extensions } from '../extensions'
import { webServer } from './WebServer'
import { environment } from '../lib/environment'

const start = async (): Promise<void> => {
  const lightship = await createLightship()
  const log = webServer.log
  const extensionServer = new ExtensionServer({
    log,
  })
  lightship.registerShutdownHandler(async () => {
    log.info('Shutting down extension server')
    await extensionServer.shutDown()
    log.info('Shutting down web server')
    await webServer.close()
  })
  try {
    await webServer.listen({ port: environment.PORT, host: '::' })
    log.info('Initialising extension server')
    await extensionServer.init()
    await extensions.reduce(async (register, extension) => {
      await register
      await extensionServer.registerExtension(extension)
    }, Promise.resolve())
    log.info('Extension registration completed successfully')
    lightship.signalReady()
  } catch (err) {
    log.fatal(err, 'Extension server failed to start')
    await lightship.shutdown()
    process.exit(-1)
  }
}

void start()
