import { type Observation } from '@medplum/fhirtypes'

export const ObservationCreatedPayloadExample = {
  resourceType: 'Observation',
  status: 'final',
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '2708-6',
        display: 'Oxygen saturation in Arterial blood',
      },
    ],
  },
  subject: {
    reference: 'Patient/9385c25c-1b28-477e-a986-4f8e008caa14',
    display: 'John Ceena',
  },
  id: '0197eafb-19a2-71ad-b368-912ed2ed92fd',
  meta: {
    versionId: '0197eafb-19a2-71ad-b368-9584b8ecee5d',
    lastUpdated: '2025-07-08T17:00:14.114Z',
    author: {
      reference: 'Practitioner/f1fe291d-c035-47e3-aaec-613b794f5502',
      display: 'Nick Hellemans',
    },
    project: 'c87cc95a-849d-48b5-9a1c-8a51b66defb7',
    compartment: [
      {
        reference: 'Project/c87cc95a-849d-48b5-9a1c-8a51b66defb7',
      },
      {
        reference: 'Patient/9385c25c-1b28-477e-a986-4f8e008caa14',
      },
    ],
  },
} satisfies Observation
