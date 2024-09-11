import { generate } from '@genql/cli'
import 'dotenv/config'
import path from 'path'

/**
 * Run with the below command:
 * yarn generate-healthie-sdk
 */
generate({
  endpoint: process.env.HEALTHIE_API_URL,
  output: path.join(__dirname, 'generated'),
  // headers: {
  //   Authorization: `Basic ${process.env.HEALTHIE_API_KEY ?? ''}`,
  //   AuthorizationSource: 'API',
  // },
}).catch(console.error)
