import z from 'zod'

export interface AddClinicalDocumentToPatientChartResponseType {
  clinicaldocumentid: number
  success: boolean
}

const DOCUMENTSUBCLASS = [
  'CLINICALDOCUMENT',
  'ADMISSIONDISCHARGE',
  'CONSULTNOTE',
  'MENTALHEALTH',
  'OPERATIVENOTE',
  'URGENTCARE',
] as const

export const AddClinicalDocumentToPatientChartInputFields = z.object({
  departmentid: z.string().min(1),
  documentsubclass: z.enum(DOCUMENTSUBCLASS),
  attachmentcontents: z.string().optional(),
  autoclose: z.boolean().optional(),
  internalnote: z.string().optional(),
  observationdate: z.string().optional(),
  priority: z.enum(['1', '2']).optional(), // 1 = HIGH; 2 = NORMAL
})

export type AddClinicalDocumentToPatientChartInputType = z.infer<
  typeof AddClinicalDocumentToPatientChartInputFields
>
