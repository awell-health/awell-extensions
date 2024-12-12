import { ElationSpecialty } from "./specialty"

export interface ElationContact {
  first_name: string
  id: number
  last_name: string
  middle_name: string
  npi: string
  practice: number
  user: number
  specialties: ElationSpecialty[]
}

export interface FindContactsResponse {
  count: number
  results: ElationContact[]
}
