import { createLightship } from 'lightship'
import { PluginServer } from './PluginServer'
import { plugins } from '../plugins'
import { webServer } from './WebServer'
import { environment } from '../lib/environment'

const start = async (): Promise<void> => {
  const lightship = await createLightship()
  try {
    await webServer.listen({ port: environment.PORT, host: '::' })
    const pluginServer = new PluginServer({
      log: webServer.log,
    })
    webServer.log.info('Initialising plugin server')
    await pluginServer.init()
    await plugins.reduce(async (register, plugin) => {
      await register
      await pluginServer.registerPlugin(plugin)
    }, Promise.resolve())
    webServer.log.info('Plugin registration completed successfully')
    lightship.signalReady()
    lightship.registerShutdownHandler(async () => {
      webServer.log.info('Shutting down plugin server')
      await pluginServer.shutDown()
      webServer.log.info('Shutting down web server')
      await webServer.close()
    })
  } catch (err) {
    webServer.log.fatal(err, 'Plugin server failed to start')
    process.exit(-1)
  }
}

void start()
