import {
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { ResponseError } from '@sendgrid/helpers/classes'
import {
  SendgridClient,
  mapSendgridErrorsToActivityErrors,
} from '../../../client'
import { ImportStatus, type ImportStatusResponse } from '../../../client/types'
import { isNil } from 'lodash'
// import { isResponseError } from '../../../client/types'

const dataPoints = {
  importStatus: {
    key: 'importStatus',
    valueType: 'string',
  },
  finishedAt: {
    key: 'finishedAt',
    valueType: 'date',
  },
  startedAt: {
    key: 'startedAt',
    valueType: 'date',
  },
  jobType: {
    key: 'jobType',
    valueType: 'string',
  },
  id: {
    key: 'id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const importStatus: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'importStatus',
  title: 'Status of Import',
  description: 'Get the status of an Import job',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { jobId, wait_for_finished },
        settings: { apiKey },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const sendgridClient = new SendgridClient({ apiKey })

      let resp: ImportStatusResponse
      if (!isNil(wait_for_finished)) {
        resp = (await sendgridClient.marketing.contacts.importStatus(jobId))[0]
          .body

        for (let i = 0; i < 9; i++) {
          if (
            [ImportStatus.COMPLETED, ImportStatus.FAILED].includes(resp.status)
          ) {
            break
          }
          await new Promise((resolve) => setTimeout(resolve, (1000 * 2) ^ i)) // exponential backoff
          resp = (
            await sendgridClient.marketing.contacts.importStatus(jobId)
          )[0].body
        }
      } else {
        resp = (await sendgridClient.marketing.contacts.importStatus(jobId))[0]
          .body
      }

      await onComplete({
        data_points: {
          importStatus: resp.status,
          finishedAt: resp.finished_at,
          startedAt: resp.started_at,
          jobType: resp.job_type,
          id: resp.id,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      } else if (err instanceof ResponseError) {
        const events = mapSendgridErrorsToActivityErrors(err)
        await onError({
          events,
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
