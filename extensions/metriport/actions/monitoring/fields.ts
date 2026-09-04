import { FieldType, type Field } from '@awell-health/extensions-core'
import { createFields } from '../patient/fields'

const { facilityId: _facilityId, ...patientFields } = createFields

/**
 * Enrolling takes the same Patient details as Create Patient, but the Facility
 * is identified through the Cohort: by convention a Cohort and the Facility
 * its Patients receive care at share a name.
 */
export const enrollInMonitoringFields = {
  cohortName: {
    id: 'cohortName',
    label: 'Cohort Name',
    description:
      'The name of the Cohort to enroll the Patient in for real-time monitoring. The Patient is created in the Facility with the same name. Matched case-insensitively, ignoring surrounding whitespace, and must identify exactly one Cohort and one Facility.',
    type: FieldType.STRING,
    required: true,
  },
  ...patientFields,
} satisfies Record<string, Field>
