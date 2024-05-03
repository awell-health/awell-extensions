import { DateOnlySchema } from '@awell-health/extensions-core'
import { z } from 'zod'

export const PatientSchema = z.object({
  id: z.string(),
  identifier: z.string().optional(),
  externalIdentifiers: z
    .array(
      z.object({
        combined: z.string(),
        id: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  active: z.boolean().optional(),
  age: z.string().optional(),
  dob: DateOnlySchema.optional(),
  email: z.string().optional(),
  firstName: z.string(), // required when creating a patient
  gender: z.string().optional(),
  genderIdentity: z
    .enum([
      'MALE',
      'FEMALE',
      'TRANS_MAN',
      'TRANS_WOMAN',
      'NON_CONFORMING',
      'DECLINE',
    ])
    .optional(),
  lastName: z.string(), // required when creating a patient
  middleName: z.string().optional(),
  mrn: z.string().optional(),
  patientMetaData: z
    .array(
      z.object({
        contextType: z.enum(['PREDEFINED', 'CUSTOM']),
        customFieldIdentifier: z.string(),
        customFieldName: z.string(),
        displayName: z.string(),
        displayNames: z.array(z.string()),
        displayOptions: z.enum([
          'PATIENT_LIST',
          'PATIENT_SEARCH',
          'PATIENT_HEADER',
          'PROVIDER_LIST',
          'PROVIDER_HEADER',
          'TASK_REQUIRED',
          'PROFILE_NAME',
          'PROFILE_HEADER',
        ]),
        fieldType: z.enum([
          'TEXT',
          'LONG_TEXT',
          'NUMBER',
          'DATE',
          'DATE_TIME',
          'PICK_LIST',
          'BOOLEAN',
          'MULTI_SELECT',
          'HYPERLINK',
          'RELATIONSHIP',
        ]),
        sortIndex: z.number(),
        value: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional(),
  patientStatus: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneMobile: z.string().optional(),
})

export type PatientResponse = z.infer<typeof PatientSchema>

export const GetPatientInputSchema = PatientSchema.pick({
  id: true,
})

export type GetPatientInputType = z.infer<typeof GetPatientInputSchema>
