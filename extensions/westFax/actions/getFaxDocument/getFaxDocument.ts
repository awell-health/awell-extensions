import { type Action, type ActivityEvent } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields } from './config'
import { dataPoints } from './config/dataPoints'
import { FieldsValidationSchema } from './config/fields'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'

export const getFaxDocument: Action<typeof fields, typeof settings> = {
  key: 'getFaxDocument',
  category: Category.COMMUNICATION,
  title: 'Get fax document',
  description: 'Get fax document with WestFax.',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, westFaxSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const activityEventLog: ActivityEvent[] = []

    const response = await westFaxSdk.getFaxDocument({
      Cookies: false,
      FaxIds1: {
        Id: fields.faxId,
      },
      format: 'pdf',
    })

    if (!response.data.Success) {
      await onError({
        events: [
          addActivityEventLog({
            message: `Error getting fax document:\n${JSON.stringify(
              response.data,
              null,
              2,
            )}`,
          }),
        ],
      })
      return
    }

    if (response.data.Result.length === 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'No fax document found',
          }),
        ],
      })
      return
    }

    if (response.data.Result.length > 1) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'More than one fax document found',
          }),
        ],
      })
      return
    }

    const faxDocument = response.data.Result[0]

    if (faxDocument.FaxFiles[0].FileContents.length === 0) {
      activityEventLog.push(
        addActivityEventLog({
          message: 'No fax file was found',
        }),
      )
    }

    if (faxDocument.FaxFiles[0].FileContents.length > 1) {
      activityEventLog.push(
        addActivityEventLog({
          message: 'More than 1 fax file was found, only storing the first one',
        }),
      )
    }

    await onComplete({
      data_points: {
        base64EncodedFax: faxDocument.FaxFiles[0].FileContents,
        direction: faxDocument.Direction,
        date: faxDocument.Date,
        status: faxDocument.Status,
        format: faxDocument.Format,
        pageCount: String(faxDocument.PageCount),
      },
    })
  },
}
