import { type z } from 'zod'
import { type SettingsValidationSchema } from '../settings'
import { type Patient } from '@medplum/fhirtypes'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
}

export const mockPatientResponse: Patient = {
  id: '404bbc59-5b60-445d-808c-b2c7b2351d9b',
  resourceType: 'Patient',
  meta: {
    project: 'a9b24c66-fb3f-4162-b94c-cb84e20311e5',
    compartment: [
      {
        reference: 'Project/a9b24c66-fb3f-4162-b94c-cb84e20311e5',
      },
      {
        reference: 'Patient/404bbc59-5b60-445d-808c-b2c7b2351d9b',
      },
    ],
    versionId: '2af2916b-9196-4a84-94b5-aa15539c1c69',
    lastUpdated: '2024-04-15T23:15:50.990Z',
    author: {
      reference: 'Practitioner/52001dfc-a4c9-445f-9bdf-81d58cbc2dbe',
      display: 'Jonathan Awell',
    },
  },
  birthDate: '1990-01-01',
  name: [
    {
      use: 'official',
      family: 'Gibson',
      given: ['Melanie'],
    },
  ],
  telecom: [
    {
      system: 'email',
      use: 'work',
      value: 'jbb@jbb.dev',
    },
  ],
  gender: 'female',
  active: true,
}
