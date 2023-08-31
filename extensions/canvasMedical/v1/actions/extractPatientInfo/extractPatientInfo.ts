import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, fieldsValidationSchema } from './config'
import { isZodError, parseUnknowError, parseZodError } from '../../utils'
import { z } from 'zod'
import { patientWithIdSchema } from '../../validation'

export const extractPatientInfo: Action<typeof fields, typeof settings> = {
  key: 'extractPatientInfo',
  category: Category.EHR_INTEGRATIONS,
  title: 'Extract Patient Info',
  description: 'Extracts common fields from a patient object',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validate({
        schema: z.object({
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const patientData = JSON.parse(payload.fields.patientData as string)
      const patient = patientWithIdSchema.parse(patientData)

      const { firstName, lastName } = patient.name.reduce(
        (acc, name) => {
          if (name.use === 'official') {
            acc.firstName = name.given.join(' ').trim()
            acc.lastName = name.family?.trim() ?? ''
          }
          return acc
        },
        { firstName: '', lastName: '' }
      )
      const phone =
        patient.telecom?.find((t) => t.system === 'phone' && t.use === 'mobile')
          ?.value ?? patient.telecom?.find((t) => t.system === 'phone')?.value
      const email = patient.telecom?.find((t) => t.system === 'email')?.value
      const dob = patient.birthDate

      await onComplete({
        data_points: {
          patientId: patient.id,
          firstName,
          lastName,
          phone,
          email,
          dob,
        },
      })
    } catch (error) {
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
