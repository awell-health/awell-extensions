import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsValidationSchema,
  PathwayContextValidationSchema,
} from './config'
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
      fields: { careFlowId, stakeholderId, exp },
      pathway: { org_id, tenant_id },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        pathway: PathwayContextValidationSchema,
      }),
      payload,
    })

    const environment = process.env.AWELL_ENVIRONMENT ?? 'test'

    const body = {
      orgId: org_id,
      tenantId: tenant_id,
      environment,
      exp: exp ?? Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
      patientId: payload.patient.id,
      careflowId: careFlowId,
      stakeholderId,
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

      const text = await response.text()
      const maybeJson = (() => {
        try {
          return JSON.parse(text)
        } catch (_) {
          return undefined
        }
      })()

      if (!response.ok) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `Failed to create Navi session: ${response.status} ${response.statusText} ${text}`,
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

      const sessionId =
        maybeJson?.sessionId ?? maybeJson?.session_id ?? maybeJson?.id ?? text

      await onComplete({
        data_points: {
          sessionId: String(sessionId),
          statusCode: String(response.status),
        },
        events: [
          addActivityEventLog({
            message: `Created Navi session for care flow ${careFlowId} (stakeholder: ${stakeholderId ?? 'patient'})`,
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
