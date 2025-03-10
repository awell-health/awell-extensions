import { type ServiceRequest } from '@medplum/fhirtypes'

export const ServiceRequestMock = {
  resourceType: 'ServiceRequest',
  id: '01956c66-683b-715c-97ef-e5b930d05ab0',
  intent: 'directive',
  status: 'active',
  priority: 'routine',
  subject: {
    reference: 'Patient/01953d3f-780c-719b-bbea-8e40ed73e67a',
    display: 'Nick Hellemans',
  },
  requester: {
    reference: 'Practitioner/c0eee7ed-ce30-456b-a0ba-eddeaaf9753a',
    display: 'Thomas Vande Casteele',
  },
} satisfies ServiceRequest
