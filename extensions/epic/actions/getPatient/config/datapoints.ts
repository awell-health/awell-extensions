import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patient: {
    key: 'patient',
    valueType: 'json',
  },
  officialGivenName: {
    key: 'officialGiveName',
    valueType: 'string',
  },
  officialFamilyName: {
    key: 'officialFamilyName',
    valueType: 'string',
  },
  birthDate: {
    key: 'birthDate',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
