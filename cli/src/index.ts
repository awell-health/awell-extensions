import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { readFileSync } from 'fs'
import { cmdList, cmdEnv, cmdDoctor, cmdSetup, cmdDescribe } from './commands'
import { runAction } from './run/action'
import { replayWebhook } from './run/webhook'
import { extensions } from '../../extensions'
import { setRegistry } from './registry'

// Composition root: this is the only place that knows about *this* repo's
// extensions. Everything else in the CLI works off the injected registry.
setRegistry(extensions)

const parseJsonArg = (
  arg: string | undefined,
  label: string,
): Record<string, unknown> => {
  if (arg === undefined) return {}
  try {
    return JSON.parse(arg) as Record<string, unknown>
  } catch (err) {
    throw new Error(`Invalid JSON for ${label}: ${(err as Error).message}`)
  }
}

const readJsonFile = (path: string, label: string): Record<string, unknown> => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  } catch (err) {
    throw new Error(
      `Failed to read ${label} from ${path}: ${(err as Error).message}`,
    )
  }
}

void yargs(hideBin(process.argv))
  .scriptName('awell-ext')
  .strict()
  .demandCommand(1, 'You must specify a command')
  .command(
    'list',
    'List every registered extension with its action and webhook keys. Use this first to confirm a new extension is registered and keyed as expected. Example: awell-ext list\n',
    () => {},
    () => {
      cmdList()
    },
  )
  .command(
    'describe <target>',
    "Print an action's input fields (id, type, required), data points, and settings status: <extension>/<action>. Use this to build the correct --fields JSON WITHOUT reading source. Prefer it over exploring config/fields.ts. Example: awell-ext describe slack/sendMessageToChannel --json\n",
    (y) =>
      y
        .positional('target', { type: 'string', demandOption: true })
        .option('json', {
          type: 'boolean',
          default: false,
          describe: 'Print machine-readable JSON to stdout',
        }),
    (argv) => {
      const [extensionKey, actionKey] = String(argv.target).split('/')
      if (extensionKey === undefined || actionKey === undefined) {
        throw new Error('Target must be <extension>/<action>')
      }
      cmdDescribe(extensionKey, actionKey, { json: argv.json })
    },
  )
  .command(
    'env <extension>',
    'Print the env var NAMES an extension expects (never values — safe to show). Use it to discover which settings map to which env vars. Example: awell-ext env slack\n',
    (y) => y.positional('extension', { type: 'string', demandOption: true }),
    (argv) => {
      cmdEnv(String(argv.extension))
    },
  )
  .command(
    'doctor <extension>',
    'Show which settings are set vs missing in the current env (no values revealed). Run before `run` to diagnose missing credentials. Example: awell-ext doctor slack\n',
    (y) => y.positional('extension', { type: 'string', demandOption: true }),
    (argv) => {
      cmdDoctor(String(argv.extension))
    },
  )
  .command(
    'setup <extension>',
    "Scaffold the extension's missing settings as empty stubs in .env for the user to fill in (non-interactive; existing values untouched). The user supplies the secret values in the file, then run `doctor` to verify. Example: awell-ext setup slack\n",
    (y) => y.positional('extension', { type: 'string', demandOption: true }),
    (argv) => {
      cmdSetup(String(argv.extension))
    },
  )
  .command(
    'run <target>',
    'Execute a real action handler and print its result (status, data_points, events, or uncaughtError). This is the primary runtime feedback loop — unlike `yarn test` it runs the real handler, not mocks. Run `doctor` first if the extension needs credentials. Example: awell-ext run slack/sendMessageToChannel --fields \'{"channel":"#general","message":"hi"}\' --json\n',
    (y) =>
      y
        .positional('target', { type: 'string', demandOption: true })
        .option('fields', { type: 'string', describe: 'Action fields as JSON' })
        .option('fields-file', {
          type: 'string',
          describe: 'Path to a JSON file with fields',
        })
        .option('patient-id', { type: 'string' })
        .option('pathway-id', { type: 'string' })
        .option('activity-id', { type: 'string' })
        .option('json', {
          type: 'boolean',
          default: false,
          describe: 'Print machine-readable JSON to stdout',
        }),
    async (argv) => {
      const [extensionKey, actionKey] = String(argv.target).split('/')
      if (extensionKey === undefined || actionKey === undefined) {
        throw new Error('Target must be <extension>/<action>')
      }
      const fields =
        argv.fieldsFile !== undefined
          ? readJsonFile(argv.fieldsFile, 'fields')
          : parseJsonArg(argv.fields, 'fields')
      await runAction({
        extensionKey,
        actionKey,
        fields,
        patientId: argv.patientId,
        pathwayId: argv.pathwayId,
        activityId: argv.activityId,
        json: argv.json,
      })
    },
  )
  .command(
    'webhook replay <target>',
    'Replay a vendor webhook payload through the real webhook handler: <extension>/<webhook>. Exercises payload parsing, patient-linking, and signature verification without waiting for a live event. Example: awell-ext webhook replay bland/callCompleted --payload-file ./fixture.json\n',
    (y) =>
      y
        .positional('target', { type: 'string', demandOption: true })
        .option('payload', {
          type: 'string',
          describe: 'Webhook payload as JSON',
        })
        .option('payload-file', {
          type: 'string',
          describe: 'Path to a JSON payload file',
        })
        .option('headers', { type: 'string', describe: 'Headers as JSON' })
        .option('headers-file', {
          type: 'string',
          describe: 'Path to a JSON headers file',
        })
        .option('json', {
          type: 'boolean',
          default: false,
          describe: 'Print machine-readable JSON to stdout',
        }),
    async (argv) => {
      const [extensionKey, webhookKey] = String(argv.target).split('/')
      if (extensionKey === undefined || webhookKey === undefined) {
        throw new Error('Target must be <extension>/<webhook>')
      }
      const payload =
        argv.payloadFile !== undefined
          ? JSON.parse(readFileSync(argv.payloadFile, 'utf8'))
          : argv.payload !== undefined
            ? JSON.parse(argv.payload)
            : {}
      const headers =
        argv.headersFile !== undefined
          ? readJsonFile(argv.headersFile, 'headers')
          : parseJsonArg(argv.headers, 'headers')
      await replayWebhook({
        extensionKey,
        webhookKey,
        payload,
        headers: Object.keys(headers).length > 0 ? (headers as any) : undefined,
        json: argv.json,
      })
    },
  )
  .help()
  .fail((msg, err, yargsObj) => {
    if (err !== undefined) {
      process.stderr.write(`Error: ${err.message}\n`)
      process.exit(1)
    }
    process.stderr.write(`${msg}\n`)
    void yargsObj.showHelp()
    process.exit(1)
  })
  .parse()
