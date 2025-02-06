import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { type DocumentReferenceCreateInputType } from '../../lib/api/FhirR4/schema'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'
import { getResourceId } from '../../lib/api/getResourceId'

export const createDocument: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createDocument',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create document',
  description: 'Create a document in Cerner',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      cernerFhirR4Sdk,
      fields: { patientResourceId, encounterResourceId, type, note },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const DocumentReferenceInput = {
      resourceType: 'DocumentReference',
      status: 'current',
      docStatus: 'final',
      type: {
        // Hardcoding the type to Progress Note for now
        coding: [
          {
            system: 'http://loinc.org',
            code: '11506-3',
            userSelected: false,
          },
        ],
        text: type,
      },
      subject: {
        reference: `Patient/${patientResourceId}`,
      },
      content: [
        {
          attachment: {
            contentType: 'text/plain;charset=utf-8',
            data: Buffer.from(note, 'utf-8').toString('base64'),
          },
        },
      ],
      context: {
        encounter: [
          {
            reference: `Encounter/${encounterResourceId}`,
          },
        ],
        // Required
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      },
    } satisfies DocumentReferenceCreateInputType

    try {
      const res = await cernerFhirR4Sdk.createDocumentReference(
        DocumentReferenceInput,
      )
      const resourceReference =
        (res.headers.Location as string) ?? (res.headers.location as string)
      const resourceId = getResourceId(resourceReference)

      await onComplete({
        data_points: {
          resourceId,
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError
        await onError({
          events: [
            addActivityEventLog({
              message: `Status: ${String(err.response?.status)} (${String(
                err.response?.statusText,
              )})\n${JSON.stringify(err.response?.data, null, 2)}`,
            }),
          ],
        })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
