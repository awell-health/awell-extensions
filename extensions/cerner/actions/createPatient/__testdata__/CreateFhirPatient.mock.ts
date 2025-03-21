import { type AxiosResponse } from 'axios'

export const CreateFhirPatientMockResponse = {
  status: 201,
  statusText: 'Created',
  headers: {
    Location:
      'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Patient/13115400',
  },
  data: {},
} satisfies Partial<AxiosResponse>
