import { type z } from 'zod'
import { type SettingsValidationSchema } from '../../settings'
import { type PatientSchemaType } from '../schema/patient'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  client_id: 'some_id',
  client_secret: 'some_secret',
  auth_url: 'https://api.preview.platform.athenahealth.com/oauth2/v1/token',
  api_url: 'https://api.preview.platform.athenahealth.com',
  scope:
    'athena/service/Athenanet.MDP.* system/Observation.read system/Patient.read',
}

export const mockPatientResponse: PatientSchemaType & Record<string, any> = {
  email: 'nick@awellhealth.com',
  guarantorcountrycode3166: 'US',
  departmentid: '1',
  portaltermsonfile: false,
  consenttotext: false,
  dob: '11/30/1993',
  patientphoto: false,
  guarantorfirstname: 'Nick',
  lastname: 'Hellemans',
  guarantorlastname: 'Hellemans',
  contactpreference_announcement_sms: false,
  guarantordob: '11/30/1993',
  guarantorrelationshiptopatient: '1',
  firstname: 'Nick',
  confidentialitycode: 'N',
  emailexists: true,
  contactpreference_lab_phone: true,
  balances: [
    {
      departmentlist: '1,21,102,144,145,148,150,157,162,166,168',
      balance: 0,
      cleanbalance: true,
      providergroupid: 1,
    },
  ],
  guarantoremail: 'nick@awellhealth.com',
  patientid: '56529',
  contactpreference_billing_phone: true,
  lastupdated: '02/16/2024',
  contactpreference_billing_sms: false,
  driverslicense: false,
  primarydepartmentid: '1',
  contactpreference_announcement_email: true,
  contactpreference_announcement_phone: true,
  guarantoraddresssameaspatient: true,
  contactpreference_appointment_phone: true,
  contactpreference_billing_email: true,
  countrycode: 'USA',
  registrationdate: '02/15/2024',
  contactpreference_appointment_sms: false,
  lastupdatedby: 'API-30490',
  guarantorcountrycode: 'USA',
  portalaccessgiven: false,
  contactpreference_lab_sms: false,
  status: 'active',
  contactpreference_appointment_email: true,
  contactpreference_lab_email: true,
  privacyinformationverified: false,
  countrycode3166: 'US',
}
