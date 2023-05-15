import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getFields } from './fields'
import { stringId } from '../../validation/generic.zod'
import { patientDataPoints } from './dataPoints'
import { isNil } from 'lodash'

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

      if (isNil(patient.personalIdentifiers)) {
        throw new Error('Patient does not have any personal identifiers.')
      }

      if (Array.isArray(patient.address)) {
        patient.address = patient.address[0]
      }

      if (Array.isArray(patient.contact)) {
        patient.contact = patient.contact[0]
      }

      const driversLicense = patient.personalIdentifiers.find(
        (id) => id.type === 'driversLicense'
      )

      await onComplete({
        data_points: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: patient.dob,
          genderAtBirth: patient.genderAtBirth,
          driversLicenseValue: driversLicense?.value,
          driversLicenseState: driversLicense?.state,
          addressLine1: patient.address.addressLine1,
          addressLine2: patient.address.addressLine2,
          city: patient.address.city,
          state: patient.address.state,
          zip: patient.address.zip,
          country: patient.address.country,
          phone: patient.contact?.phone,
          email: patient.contact?.email,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
