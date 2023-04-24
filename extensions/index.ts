import { Awell } from './awell'
import { CalDotCom } from './calDotCom'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { Twilio } from './twilio'
import { DropboxSign } from './dropboxSign'
import { Elation } from './elation'
import { MessageBird } from './messagebird'
import { MathExtension } from './math'
import { Mailgun } from './mailgun'
import { Formsort } from './formsort'
// import { AvaAi } from './avaAi'
import { Mailchimp } from './mailchimp'
// import { Cloudinary } from './cloudinary'

export const extensions = [
  // AvaAi, Best to disable this until we cleared out data privacy & HIPAA with OpenAI
  Awell,
  // Cloudinary, Not ready yet for release in v1.0.3
  HelloWorld,
  Healthie,
  Twilio,
  CalDotCom,
  DropboxSign,
  Elation,
  Mailgun,
  MessageBird,
  MathExtension,
  Formsort,
  Mailchimp,
]
