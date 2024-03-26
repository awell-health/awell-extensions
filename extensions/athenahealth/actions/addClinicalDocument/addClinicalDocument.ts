import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { htmlToBase64Pdf, validatePayloadAndCreateClient } from '../../helpers'

export const addClinicalDocument: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addClinicalDocument',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add clinical document to chart',
  description: 'Add clinical document to patient chart',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: input,
      client,
      settings: { practiceId },
    } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const contentAsBase64String = await htmlToBase64Pdf(
      input.attachmentcontents ?? ''
    )

    const res = await client.addClinicalDocumentToPatientChart({
      practiceId,
      patientId: input.patientid,
      data: {
        departmentid: input.departmentid,
        documentsubclass: 'CLINICALDOCUMENT',
        attachmentcontents: contentAsBase64String,
      },
    })

    if (res.success) {
      await onComplete({
        data_points: {
          clinicalDocumentId: String(res.clinicaldocumentid),
        },
      })
      return
    }

    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: {
            en: 'Unable to add the clinical document to the patient chart',
          },
          error: {
            category: 'SERVER_ERROR',
            message: 'Unable to add the clinical document to the patient chart',
          },
        },
      ],
    })
  },
}
