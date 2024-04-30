import { type ServiceRequest } from '@medplum/fhirtypes'

export const mockCreateServiceRequestResponse: ServiceRequest = {
  resourceType: 'ServiceRequest',
  status: 'active',
  intent: 'directive',
  subject: {
    reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
    display: 'Demoooo',
  },
  id: '55f8ad4d-3d4d-4e40-afde-8cfa058bdaa5',
  meta: {
    versionId: 'baf54867-0601-4d97-8c85-056068a28a6d',
    lastUpdated: '2024-04-30T13:33:00.643Z',
    author: {
      reference: 'Practitioner/44af435c-38aa-464c-9b68-d0f4f103d8be',
      display: 'Nick Hellemans',
    },
    project: 'a9b24c66-fb3f-4162-b94c-cb84e20311e5',
    compartment: [
      {
        reference: 'Project/a9b24c66-fb3f-4162-b94c-cb84e20311e5',
      },
      {
        reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
      },
    ],
  },
}
