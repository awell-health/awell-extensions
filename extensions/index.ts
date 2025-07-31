import { athenahealth } from './athenahealth'
import { availity } from './availity'
import { Awell } from './awell'
import { awellTasks } from './awellTasks'
import { bland } from './bland'
import { Braze } from './braze'
import { CalDotCom } from './calDotCom'
import { Calendly } from './calendly'
import { CanvasMedical } from './canvasMedical'
import { cerner } from './cerner'
import { Cloudinary } from './cloudinary'
import { CmDotCom } from './cmDotCom'
import { CollectData } from './collectData'
import { customerIo } from './customerIo'
import { dateHelpers } from './dateHelpers'
import { dockHealth } from './dockHealth'
import { DocuSign } from './docuSign'
import { DropboxSign } from './dropboxSign'
import { Elation } from './elation'
import { epic } from './epic'
import { Experimental } from './experimental'
import { ExternalServer } from './external-server'
import { Formsort } from './formsort'
import { freshdesk } from './freshdesk'
import { freshsales } from './freshsales'
import { Gridspace } from './gridspace'
import { Healthie } from './healthie'
import { HelloWorld } from './hello-world'
import { hubspot } from './hubspot'
import { identityVerification } from './identityVerification'
import { Infobip } from './infobip'
import { Iterable } from './iterable'
import { landingAi } from './landingAi'
import { Mailchimp } from './mailchimp'
import { Mailgun } from './mailgun'
import { MathExtension } from './math'
import { Medplum } from './medplum'
import { MessageBird } from './messagebird'
// import { Metriport } from './metriport'
import { nexuzhealth } from './nexuzhealth'
import { rest } from './rest'
import { Sendbird } from './sendbird'
import { Sendgrid } from './sendgrid-extension'
import { sfdc } from './sfdc'
import { shelly } from './shelly'
import { stedi } from './stedi'
import { stripe } from './stripe'
import { TalkDesk } from './talkDesk'
import { TextLine } from './textline'
import { TextEmAll } from './text-em-all'
import { Transform } from './transform'
import { Twilio } from './twilio'
import { WestFax } from './westFax'
import { Workramp } from './workramp'
import { Zendesk } from './zendesk'
import { zoom } from './zoom'

import * as json from './markdown.json'

export type Markdown = Record<string, { readme: string; changelog: string }>
export const markdown: Markdown = json

export const extensions = [
  bland,
  Braze,
  athenahealth,
  availity,
  Awell,
  awellTasks,
  CalDotCom,
  Calendly,
  CanvasMedical,
  cerner,
  Cloudinary,
  CmDotCom,
  CollectData,
  customerIo,
  dateHelpers,
  dockHealth,
  DocuSign,
  DropboxSign,
  Elation,
  epic,
  Experimental,
  ExternalServer,
  Formsort,
  freshdesk,
  freshsales,
  Gridspace,
  Healthie,
  HelloWorld,
  hubspot,
  identityVerification,
  Infobip,
  Iterable,
  landingAi,
  Mailchimp,
  Mailgun,
  MathExtension,
  MessageBird,
  Medplum,
  // Metriport,
  nexuzhealth,
  rest,
  Sendbird,
  Sendgrid,
  sfdc,
  shelly,
  stedi,
  stripe,
  TalkDesk,
  TextLine,
  TextEmAll,
  Transform,
  Twilio,
  WestFax,
  Workramp,
  Zendesk,
  zoom,
]
