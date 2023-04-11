export interface Patient {
  id: string
  profile?: {
    first_name?: string
    last_name?: string
    name?: string
    birth_date?: string
    email?: string
    phone?: string
    mobile_phone?: string
    patient_code?: string
    national_registry_number?: string
    sex?: 'MALE' | 'FEMALE' | 'NOT_KNOWN'
    preferred_language?: string
    address?: {
      street?: string
      city?: string
      country?: string
      state?: string
      zip?: string
    }
  }
}
