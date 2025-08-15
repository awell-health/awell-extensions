import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const createNaviSession: Action<typeof fields, typeof settings> = {
  key: 'createNaviSession',
  category: Category.WORKFLOW,
  title: 'Create Navi Session',
  description: 'Create a Navi portal session for a stakeholder',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      fields: { stakeholderId, exp },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const careflowId = payload.pathway.id
    const orgId = payload.pathway.org_id
    const tenantId = payload.pathway.tenant_id
    const environment = process.env.AWELL_ENVIRONMENT ?? 'test'

    const body = {
      orgId,
      tenantId,
      environment,
      exp: exp ?? Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
      patientId: payload.patient.id,
      stakeholderId: stakeholderId ?? payload.patient.id,
      careflowId,
    }

    try {
      const response = await fetch(
        'https://navi-portal.awellhealth.com/api/session/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )

      const ResponseSchema = z.union([
        z.object({ session_id: z.string() }),
        z.object({ error: z.string() }),
      ])
      const json = ResponseSchema.parse(await response.json())

      if (!response.ok || 'error' in json) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `Failed to create Navi session: ${response.status} ${response.statusText} ${
                  'error' in json ? json.error : ''
                }`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `Failed to create Navi session: ${response.status} ${response.statusText}`,
              },
            },
          ],
        })
        return
      }

      const sessionId = json.session_id
      if (sessionId == null) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: 'Failed to create Navi session: missing session id in response',
              },
              error: {
                category: 'SERVER_ERROR',
                message:
                  'Failed to create Navi session: missing session id in response',
              },
            },
          ],
        })
        return
      }

      await onComplete({
        data_points: {
          sessionId,
          statusCode: String(response.status),
          naviSessionUrl: `https://navi-portal.awellhealth.com/direct/${sessionId}`,
        },
        events: [
          addActivityEventLog({
            message: `Created Navi session for care flow ${careflowId} (stakeholder: ${stakeholderId ?? 'patient'})`,
          }),
        ],
      })
    } catch (error) {
      const err = error as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: err.message ?? 'Unexpected error while creating Navi session',
            },
            error: {
              category: 'SERVER_ERROR',
              message:
                err.message ?? 'Unexpected error while creating Navi session',
            },
          },
        ],
      })
    }
  },
}
