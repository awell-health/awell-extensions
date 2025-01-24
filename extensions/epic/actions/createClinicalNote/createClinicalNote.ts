import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { type DocumentReferenceCreateInputType } from '../../lib/api/FhirR4/schema'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'
import { LoincCodeTypesDictionary } from '../../lib/api/customFhirSchemas/DocumentReference'

export const createClinicalNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createClinicalNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create clinical note',
  description: 'Create a clinical note in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { patientResourceId, encounterResourceId, status, type, note },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const DocumentReferenceInput = {
      resourceType: 'DocumentReference',
      docStatus: status,
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: LoincCodeTypesDictionary[type].code,
            display: LoincCodeTypesDictionary[type].label,
          },
        ],
        text: LoincCodeTypesDictionary[type].label,
      },
      subject: {
        reference: `Patient/${patientResourceId}`,
      },
      content: [
        {
          attachment: {
            contentType: 'text/plain',
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
      },
    } satisfies DocumentReferenceCreateInputType

    try {
      const res = await epicFhirR4Sdk.createDocumentReference(
        DocumentReferenceInput,
      )
      const resourceReference =
        (res.headers.Location as string) ?? (res.headers.location as string)
      const resourceId = resourceReference.split('/')[1]

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
              message: JSON.stringify(err.response?.data, null, 2),
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
