import { defineEndpoint } from '@awell-health/extensions-core'
import { isUndefined, omitBy } from 'lodash'
import { z } from 'zod'

const trimmedString = z.string().trim()

/**
 * Experimental. The payload is the record: one POST is one patient. Everything
 * but the subject key is optional so a partial payload still ingests what it
 * carries. Field names (`Gender` included) match the data workbench as-is.
 */
export const dataIngestionSchema = z.looseObject({
  patient_id: trimmedString.min(1),
  facility_name: trimmedString.optional(),
  Gender: trimmedString.optional(),
  first_name: trimmedString.optional(),
  last_name: trimmedString.optional(),
  birth_date: trimmedString.optional(),
  address: z
    .looseObject({
      street: trimmedString.optional(),
      city: trimmedString.optional(),
      state: trimmedString.optional(),
      zip: trimmedString.optional(),
    })
    .optional(),
})

export const dataIngestion = defineEndpoint({
  key: 'dataIngestion',
  title: 'Data ingestion (experimental)',
  description:
    'Experimental endpoint. POST a patient payload to write demographics to the data store and publish a care flow start event. Identifies the patient by `patient_id`.',
  source: 'webhook',
  schema: dataIngestionSchema,
  identifier: { resolveValue: (record) => record.patient_id },
  run: async ({ record, store, events }) => {
    store.save(
      'patient',
      omitBy(
        {
          facility_name: record.facility_name,
          Gender: record.Gender,
          first_name: record.first_name,
          last_name: record.last_name,
          birth_date: record.birth_date,
          address: record.address,
        },
        isUndefined,
      ),
    )

    events.publish({ key: 'careflow.start' })
  },
})
