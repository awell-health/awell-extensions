import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { isEmpty, isNil } from 'lodash'

export const trackPersonEvent: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'trackPersonEvent',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Track person event',
  description: 'Track a person event in Customer.io',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { customerIoTrackClient, fields, pathway, patient, activity } =
      await validatePayloadAndCreateSdks({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

    const patientIdentifiers = patient.profile?.identifier
    const patientIdentifiersAttributes =
      !isNil(patientIdentifiers) && !isEmpty(patientIdentifiers)
        ? patientIdentifiers.reduce<Record<string, string>>(
            (acc, identifier) => {
              acc[`_awell_identifier_${identifier.system}`] = identifier.value
              return acc
            },
            {},
          )
        : {}

    await customerIoTrackClient.trackPersonEvent({
      type: 'person',
      action: 'event',
      name: fields.eventName,
      identifiers: {
        [fields.personIdentifierType]: fields.identifierValue,
      },
      attributes: {
        _awell_careflow_id: pathway.id,
        _awell_careflow_definition_id: pathway.definition_id,
        _awell_patient_id: patient.id,
        _awell_activity_id: activity.id,
        ...patientIdentifiersAttributes,
        ...fields.attributes,
      },
    })

    await customerIoTrackClient.trackPersonEvent({
      type: 'person',
      action: 'event',
      name: fields.eventName,
      identifiers: {
        [fields.personIdentifierType]: fields.identifierValue,
      },
      attributes: {
        _awell_careflow_id: pathway.id,
        _awell_careflow_definition_id: pathway.definition_id,
        _awell_patient_id: patient.id,
        _awell_activity_id: activity.id,
        ...fields.attributes,
      },
    })

    await onComplete()
  },
}
