import { type DataPointDefinition } from '@awell-health/extensions-core'
import { type DischargeSummaryFields } from './extract'

/**
 * The discharge summary fields, one data point each, shared by both webhook
 * bundle actions. All are omitted for a bundle that is not a discharge
 * summary, and each text field is omitted when the document lacks it.
 */
export const dischargeSummaryDataPoints = {
  reasonForVisit: { key: 'reasonForVisit', valueType: 'string' },
  visitDiagnosis: { key: 'visitDiagnosis', valueType: 'string' },
  planOfTreatment: { key: 'planOfTreatment', valueType: 'string' },
  procedures: { key: 'procedures', valueType: 'string' },
  procedureNote: { key: 'procedureNote', valueType: 'string' },
  dischargeDisposition: { key: 'dischargeDisposition', valueType: 'string' },
  dischargeDispositionCode: {
    key: 'dischargeDispositionCode',
    valueType: 'string',
  },
  dischargeInstructions: { key: 'dischargeInstructions', valueType: 'string' },
  dischargeSummaryCoverage: {
    key: 'dischargeSummaryCoverage',
    valueType: 'json',
  },
} satisfies Record<keyof DischargeSummaryFields, DataPointDefinition>
