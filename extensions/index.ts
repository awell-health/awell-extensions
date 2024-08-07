import { Awell } from './awell'
import { CalDotCom } from './calDotCom'
import { Calendly } from './calendly'
import { CanvasMedical } from './canvasMedical'
import { Cloudinary } from './cloudinary'
import { DropboxSign } from './dropboxSign'
import { Elation } from './elation'
import { Experimental } from './experimental'
import { Formsort } from './formsort'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { Mailchimp } from './mailchimp'
import { Mailgun } from './mailgun'
import { MathExtension } from './math'
import { MessageBird } from './messagebird'
import { Metriport } from './metriport'
import { Twilio } from './twilio'
import { Sendgrid } from './sendgrid-extension'
import { CmDotCom } from './cmDotCom'
import { TalkDesk } from './talkDesk'
import { DocuSign } from './docuSign'
import { Sendbird } from './sendbird'
import { Transform } from './transform'
import { Iterable } from './iterable'
import { Zendesk } from './zendesk'
import { Infobip } from './infobip'
import { WestFax } from './westFax'
import { nexuzhealth } from './nexuzhealth'
import { CollectData } from './collectData'
import { athenahealth } from './athenahealth'
import { icd } from './icd'
import { TextLine } from './textline'
import { Medplum } from './medplum'
import { dockHealth } from './dockHealth'
import { stripe } from './stripe'

import * as json from './markdown.json'
import { ExternalServer } from './external-server'

export type Markdown = Record<string, { readme: string; changelog: string }>
export const markdown: Markdown = json

export const extensions = [
  Awell,
  athenahealth,
  CalDotCom,
  Calendly,
  CanvasMedical,
  Cloudinary,
  CmDotCom,
  CollectData,
  dockHealth,
  DocuSign,
  DropboxSign,
  Elation,
  Experimental,
  ExternalServer,
  Formsort,
  Healthie,
  HelloWorld,
  icd,
  Infobip,
  Iterable,
  Mailchimp,
  Mailgun,
  MathExtension,
  MessageBird,
  Medplum,
  Metriport,
  nexuzhealth,
  Sendbird,
  Sendgrid,
  stripe,
  TalkDesk,
  TextLine,
  Transform,
  Twilio,
  Zendesk,
  WestFax,
]
