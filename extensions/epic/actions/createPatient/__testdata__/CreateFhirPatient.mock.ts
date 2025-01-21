import { type AxiosResponse } from 'axios'

export const CreateFhirPatientMockResponse = {
  status: 201,
  statusText: 'Created',
  headers: {
    Location: 'Patient/eKquahyPZlalzKHM5DZX3lA3',
  },
  data: {},
} satisfies Partial<AxiosResponse>
