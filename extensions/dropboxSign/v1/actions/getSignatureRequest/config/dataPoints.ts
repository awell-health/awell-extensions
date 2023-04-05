import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  title: {
    key: 'title',
    valueType: 'string',
  },
  originalTitle: {
    key: 'originalTitle',
    valueType: 'string',
  },
  subject: {
    key: 'subject',
    valueType: 'string',
  },
  message: {
    key: 'message',
    valueType: 'string',
  },
  signingUrl: {
    key: 'signingUrl',
    valueType: 'string',
  },
  signingRedirectUrl: {
    key: 'signingRedirectUrl',
    valueType: 'string',
  },
  detailsUrl: {
    key: 'detailsUrl',
    valueType: 'string',
  },
  requesterEmailAddress: {
    key: 'requesterEmailAddress',
    valueType: 'string',
  },
  signerEmailAddress: {
    key: 'signerEmailAddress',
    valueType: 'string',
  },
  signerName: {
    key: 'signerName',
    valueType: 'string',
  },
  signerRole: {
    key: 'signerRole',
    valueType: 'string',
  },
  statusCode: {
    key: 'statusCode',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
