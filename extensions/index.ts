// import { AvaAi } from './avaAi'
import { Awell } from './awell'
import { CalDotCom } from './calDotCom'
import { CanvasMedical } from './canvasMedical'
import { Cloudinary } from './cloudinary'
import { DropboxSign } from './dropboxSign'
import { Elation } from './elation'
import { Formsort } from './formsort'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { Mailchimp } from './mailchimp'
import { Mailgun } from './mailgun'
import { MathExtension } from './math'
import { MessageBird } from './messagebird'
import { Metriport } from './metriport'
import { Twilio } from './twilio'
import { Wellinks } from './wellinks'
import { Sendgrid } from './sendgrid-extension'
import { CmDotCom } from './cmDotCom'
import { DocuSign } from './docuSign'
import { Sendbird } from './sendbird'
import { Transform } from './transform'
import { Iterable } from './iterable'
import { Zendesk } from './zendesk'
import { Infobip } from './infobip'

import * as json from './markdown.json'

export type Markdown = Record<string, { readme: string; changelog: string }>
export const markdown: Markdown = json

export const extensions = [
  // AvaAi, Best to disable this until we cleared out data privacy & HIPAA with OpenAI
  Awell,
  CalDotCom,
  CanvasMedical,
  Cloudinary,
  DropboxSign,
  Elation,
  Formsort,
  Healthie,
  HelloWorld,
  Mailchimp,
  Mailgun,
  MathExtension,
  MessageBird,
  Metriport,
  Transform,
  Twilio,
  Wellinks,
  Sendgrid,
  CmDotCom,
  DocuSign,
  Sendbird,
  // ZusHealth is not ready for public use yet
  // ZusHealth,
  Iterable,
  Zendesk,
  Infobip,
]
