import { FieldType, type Field } from '@awell-health/extensions-core'

export const startConsolidatedQueryFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the Patient whose consolidated data to query',
    type: FieldType.STRING,
    required: true,
  },
  resources: {
    id: 'resources',
    label: 'Resource Types',
    description:
      'Optional comma-separated list of FHIR resource types to filter by (e.g. "Condition,Observation,MedicationRequest"). If empty, all resource types are returned.',
    type: FieldType.STRING,
  },
  dateFrom: {
    id: 'dateFrom',
    label: 'Date From',
    description:
      'Optional start date to filter resources by (inclusive), formatted YYYY-MM-DD',
    type: FieldType.STRING,
  },
  dateTo: {
    id: 'dateTo',
    label: 'Date To',
    description:
      'Optional end date to filter resources by (inclusive), formatted YYYY-MM-DD',
    type: FieldType.STRING,
  },
  conversionType: {
    id: 'conversionType',
    label: 'Conversion Type',
    description:
      'How to render the medical record: "json" (default), "pdf", or "html"',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const getConsolidatedQueryStatusFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the Patient whose consolidated data query status to check',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
