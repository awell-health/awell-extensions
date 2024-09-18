// import { AwellSdk } from '@awell-health/awell-sdk'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const medicationFromImage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'medicationFromImage',
  category: Category.WORKFLOW,
  title: 'Extract medication from image',
  description: 'Generates structured medication list from picture ',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { imageUrl },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      console.log(imageUrl)

      // Call whatever API with the file URL and get back JSON (ideally in the following format)
      const data = await Promise.resolve({
        medications: [
          {
            product_rxcui: '809854',
            product_name:
              'hydrochlorothiazide 12.5 MG / quinapril 10 MG Oral Tablet [Accuretic]', // Full medication name
            brand_name: 'Accuretic', // Brand name
            dose_form_name: 'Oral Tablet', // Dose form, such as tablet, capsule, etc.
            prescribable_name: 'Accuretic 10 MG / 12.5 MG Oral Tablet', // Name used for prescribing
            extracted_medication_name: 'Accuretic', // Extracted name from image
            extracted_brand_name: 'Accuretic', // Extracted brand name from image
            extracted_dosage: '10 mg / 12.5 mg', // Extracted dosage information
            extracted_ndcg: '0006-0711-31', // National Drug Code (optional)
          },
        ],
      })

      await onComplete({
        data_points: {
          data: JSON.stringify(data),
        },
      })
    } catch (error) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'Something went wrong while extracting the medications',
            },
            error: {
              category: 'SERVER_ERROR',
              message: (error as Error).message,
            },
          },
        ],
      })
    }
  },
}
