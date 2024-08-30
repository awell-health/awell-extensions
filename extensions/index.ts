import { athenahealth } from './athenahealth'
import { Awell } from './awell'
import { CalDotCom } from './calDotCom'
import { Calendly } from './calendly'
import { CanvasMedical } from './canvasMedical'
import { Cloudinary } from './cloudinary'
import { CmDotCom } from './cmDotCom'
import { CollectData } from './collectData'
import { dockHealth } from './dockHealth'
import { DocuSign } from './docuSign'
import { DropboxSign } from './dropboxSign'
import { Elation } from './elation'
import { Experimental } from './experimental'
import { ExternalServer } from './external-server'
import { Formsort } from './formsort'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { icd } from './icd'
import { Infobip } from './infobip'
import { Iterable } from './iterable'
import { Mailchimp } from './mailchimp'
import { Mailgun } from './mailgun'
import { MathExtension } from './math'
import { Medplum } from './medplum'
import { MessageBird } from './messagebird'
import { Metriport } from './metriport'
import { nexuzhealth } from './nexuzhealth'
import { rest } from './rest'
import { Sendbird } from './sendbird'
import { Sendgrid } from './sendgrid-extension'
import { sfdc } from './sfdc'
import { stripe } from './stripe'
import { TalkDesk } from './talkDesk'
import { TextLine } from './textline'
import { Transform } from './transform'
import { Twilio } from './twilio'
import { WestFax } from './westFax'
import { Workramp } from './workramp'
import { Zendesk } from './zendesk'

import * as json from './markdown.json'

export type Markdown = Record<string, { readme: string; changelog: string }>
export const markdown: Markdown = json

export const extensions = [
  athenahealth,
  Awell,
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
  rest,
  Sendbird,
  Sendgrid,
  sfdc,
  stripe,
  TalkDesk,
  TextLine,
  Transform,
  Twilio,
  WestFax,
  Workramp,
  Zendesk,
]
