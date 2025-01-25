import { z } from 'zod'

/**
 * See https://fhir.epic.com/Sandbox?api=1046
 */
export const TypeSchema = z.enum([
  'Progress Note',
  'Consult Note',
  'Procedure Note',
  'H&P Note',
  'Discharge Summary',
  'ED Note',
  'Patient Instructions',
  'Nursing Note',
])

export const LoincCodeTypesDictionary: Record<
  z.infer<typeof TypeSchema>,
  { code: string; label: string }
> = {
  'Progress Note': { code: '11506-3', label: 'Progress Note' },
  'Consult Note': { code: '11488-4', label: 'Consult Note' },
  'Procedure Note': { code: '28570-0', label: 'Procedure Note' },
  'H&P Note': { code: '34117-2', label: 'H&P Note' },
  'Discharge Summary': { code: '18842-5', label: 'Discharge Summary' },
  'ED Note': { code: '34111-5', label: 'ED Note' },
  'Patient Instructions': { code: '69730-0', label: 'Patient Instructions' },
  'Nursing Note': { code: '34746-8', label: 'Nursing Note' },
} as const
