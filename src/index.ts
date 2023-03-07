import { createLightship } from 'lightship'
import { ExtensionServer } from './ExtensionServer'
import { extensions } from '../extensions'
import { webServer } from './WebServer'
import { environment } from '../lib/environment'

const start = async (): Promise<void> => {
  const lightship = await createLightship()
  try {
    await webServer.listen({ port: environment.PORT, host: '::' })
    const extensionServer = new ExtensionServer({
      log: webServer.log,
    })
    webServer.log.info('Initialising extension server')
    await extensionServer.init()
    await extensions.reduce(async (register, extension) => {
      await register
      await extensionServer.registerExtension(extension)
    }, Promise.resolve())
    webServer.log.info('Extension registration completed successfully')
    lightship.signalReady()
    lightship.registerShutdownHandler(async () => {
      webServer.log.info('Shutting down extension server')
      await extensionServer.shutDown()
      webServer.log.info('Shutting down web server')
      await webServer.close()
    })
  } catch (err) {
    webServer.log.fatal(err, 'Extension server failed to start')
    process.exit(-1)
  }
}

void start()
