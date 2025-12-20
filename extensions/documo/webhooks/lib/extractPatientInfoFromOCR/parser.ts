import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

/**
 * Zod schema for the extracted patient information
 */
export const PatientInfoSchema = z.object({
  patient_first_name: z
    .string()
    .nullable()
    .describe("Patient's first/given name"),
  patient_last_name: z
    .string()
    .nullable()
    .describe("Patient's last/family name"),
  patient_full_name: z
    .string()
    .nullable()
    .describe('Full name as written in document'),
  patient_dob: z
    .string()
    .nullable()
    .describe('Date of birth in YYYY-MM-DD format'),
  patient_phone: z
    .string()
    .nullable()
    .describe("Patient's phone number in E.164 format (e.g. +14155551234)"),
  patient_state: z
    .string()
    .nullable()
    .describe(
      "Patient's state of residence (2-letter US state code e.g. CA, NY, TX)",
    ),
  insurance_name: z
    .string()
    .nullable()
    .describe('Insurance company or plan name'),
  insurance_policy_number: z
    .string()
    .nullable()
    .describe('Policy/Member ID number'),
  insurance_group_number: z
    .string()
    .nullable()
    .describe('Group number if present'),
  insurance_policy_holder: z.string().nullable().describe('Policy holder name'),
  referring_physician_name: z
    .string()
    .nullable()
    .describe('Name of referring physician/provider'),
  confidence_level: z
    .number()
    .min(0)
    .max(100)
    .describe('Confidence level of the extraction (0-100)'),
  extraction_notes: z
    .string()
    .describe('Brief notes about the extraction process'),
})

export type PatientInfo = z.infer<typeof PatientInfoSchema>

/**
 * Structured Output Parser for patient information extraction
 */
export const parser = StructuredOutputParser.fromZodSchema(PatientInfoSchema)
