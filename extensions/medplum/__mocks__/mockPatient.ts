import { type Patient } from '@medplum/fhirtypes'

export const mockGetPatientResponse: Patient = {
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

export const mockCreatePatientResponse: Patient = {
  resourceType: 'Patient',
  identifier: [
    {
      system: 'https://www.awellhealth.com/',
      value: 'test-id',
      assigner: {
        display: 'Awell',
      },
    },
  ],
  name: [
    {
      use: 'official',
      family: 'Demo',
      given: ['Awell'],
    },
  ],
  telecom: [
    {
      system: 'phone',
      value: '+18882062011',
      use: 'mobile',
    },
    {
      system: 'email',
      value: 'test@awellhealth.com',
      use: 'home',
    },
  ],
  birthDate: '1993-11-30',
  gender: 'male',
  address: [
    {
      use: 'home',
      line: ['Awell Street'],
      city: 'Awell City',
      state: 'Awell State',
      postalCode: '1111',
      country: 'Awellien',
    },
  ],
  id: '0327233d-090b-4e8a-ae6d-91c49fc275c4',
  meta: {
    versionId: 'bb730b04-cddb-4d38-9544-f3531c903a4d',
    lastUpdated: '2024-04-30T11:00:17.965Z',
    author: {
      reference: 'ClientApplication/d8ab9ce8-7c71-41fe-8996-b19dceca2daa',
      display: 'Awell Health Default Client',
    },
    project: 'a9b24c66-fb3f-4162-b94c-cb84e20311e5',
    compartment: [
      {
        reference: 'Project/a9b24c66-fb3f-4162-b94c-cb84e20311e5',
      },
      {
        reference: 'Patient/0327233d-090b-4e8a-ae6d-91c49fc275c4',
      },
    ],
  },
}
