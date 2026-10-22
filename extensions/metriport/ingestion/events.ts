import { event } from '@awell-health/extensions-core'

/**
 * The events the ADT endpoint publishes, declared so the events manifest built
 * at release gives each key a label. The keys are what care flows subscribe to,
 * so they stay generic: `patient.admitted` means the same thing from any source.
 * None carries a payload; a listener reads the record or the retained bundle.
 */
export const fhirBundleReceived = event('fhir.bundle-received', {
  label: 'FHIR bundle received',
})
export const patientAdmitted = event('patient.admitted', {
  label: 'Patient admitted',
})
export const patientTransferred = event('patient.transferred', {
  label: 'Patient transferred',
})
export const patientDischarged = event('patient.discharged', {
  label: 'Patient discharged',
})
export const dischargeSummaryReceived = event('discharge.summary-received', {
  label: 'Discharge summary received',
})

export const events = [
  fhirBundleReceived,
  patientAdmitted,
  patientTransferred,
  patientDischarged,
  dischargeSummaryReceived,
]
