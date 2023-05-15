import {
  type PatientCreate as MetriportPatientCreate,
  usStateSchema,
} from '@metriport/api'
import { isValid } from 'driver-license-validator'
import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { createFields } from './fields'
import { stringId } from '../../validation/generic.zod'
import { type PatientCreate, patientCreateSchema } from './validation'
import { patientIdDataPoint } from './dataPoints'

export const createPatient: Action<
  typeof createFields,
  typeof settings,
  keyof typeof patientIdDataPoint
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Patient',
  description:
    'Creates a Patient in Metriport for the specified Facility where the patient is receiving care.',
  fields: createFields,
  previewable: true,
  dataPoints: patientIdDataPoint,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patient = patientCreateSchema.parse(payload.fields)

      const facilityId = stringId.parse(payload.fields.facilityId)

      const patientMetriport = convertToMetriportPatient(patient)

      const api = createMetriportApi(payload.settings)

      const { id } = await api.createPatient(patientMetriport, facilityId)

      await onComplete({
        data_points: {
          patientId: String(id),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}

export const convertToMetriportPatient = (
  patient: PatientCreate
): MetriportPatientCreate => {
  const patientMetriport: MetriportPatientCreate = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob,
    genderAtBirth: patient.genderAtBirth,
    address: {
      addressLine1: patient.addressLine1,
      addressLine2: patient.addressLine2,
      city: patient.city,
      state: patient.state,
      zip: patient.zip,
      country: patient.country,
    },
    personalIdentifiers: [],
    contact: {
      phone: patient.phone,
      email: patient.email,
    },
  }

  if (
    patient.driversLicenseState !== undefined &&
    patient.driversLicenseValue === undefined
  ) {
    throw new Error(
      'Drivers license value is required when drivers license state is provided'
    )
  } else if (
    patient.driversLicenseState === undefined &&
    patient.driversLicenseValue !== undefined
  ) {
    throw new Error(
      'Drivers license state is required when drivers license value is provided'
    )
  }

  if (
    patient.driversLicenseState !== undefined &&
    patient.driversLicenseState.length > 0 &&
    patient.driversLicenseValue !== undefined &&
    patient.driversLicenseValue.length > 0
  ) {
    const valid = isValid(patient.driversLicenseValue, {
      states: patient.driversLicenseState,
    })

    if (valid) {
      ;(patientMetriport.personalIdentifiers ?? []).push({
        type: 'driversLicense',
        value: patient.driversLicenseValue,
        state: usStateSchema.parse(patient.driversLicenseState),
      })
    }
  }

  return patientMetriport
}
