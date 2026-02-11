import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getFields } from './fields'
import { stringId } from '../../validation/generic.zod'
import { patientDataPoints } from './dataPoints'

export const getPatient: Action<
  typeof getFields,
  typeof settings,
  keyof typeof patientDataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Patient',
  description: 'Gets a Patient.',
  fields: getFields,
  previewable: true,
  dataPoints: patientDataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patientId = stringId.parse(payload.fields.patientId)

      const api = createMetriportApi(payload.settings)
      const patient = await api.getPatient(patientId)

      const address = Array.isArray(patient.address)
        ? patient.address[0]
        : patient.address

      const contact = Array.isArray(patient.contact)
        ? patient.contact[0]
        : patient.contact

      const driversLicense = (patient.personalIdentifiers ?? []).find(
        (id) => id.type === 'driversLicense',
      )

      await onComplete({
        data_points: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: patient.dob,
          genderAtBirth: patient.genderAtBirth,
          driversLicenseValue: driversLicense?.value,
          driversLicenseState: driversLicense?.state,
          addressLine1: address?.addressLine1,
          addressLine2: address?.addressLine2,
          city: address?.city,
          state: address?.state,
          zip: address?.zip,
          country: address?.country,
          phone: contact?.phone ?? undefined,
          email: contact?.email ?? undefined,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
