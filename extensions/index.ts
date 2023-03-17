import { withDocumentation } from '../src/utils'
import { Awell } from './awell'
import { CalDotCom } from './calDotCom'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { Twilio } from './twilio'

export const extensions = withDocumentation([
  Awell,
  HelloWorld,
  Healthie,
  Twilio,
  CalDotCom,
])
