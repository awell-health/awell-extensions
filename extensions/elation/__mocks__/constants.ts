import { type AppointmentInput } from '../types/appointment'
import { type NonVisitNoteResponse } from '../types/nonVisitNote'
import { type PatientInput } from '../types/patient'
import { type PhysicianResponse } from '../types/physician'

export const patientExample: PatientInput = {
  first_name: 'Test',
  middle_name: 'P',
  last_name: 'Action',
  actual_name: 'local test action',
  gender_identity: 'man',
  legal_gender_marker: 'M',
  pronouns: 'he_him_his',
  sex: 'Male',
  sexual_orientation: 'unknown',
  primary_physician: 141127177601026,
  caregiver_practice: 141127173275652,
  dob: '1940-08-29',
  ssn: '123456789',
  race: 'Asian',
  preferred_language: 'English',
  ethnicity: 'Not Hispanic or Latino',
  notes: 'This is test Notes',
  previous_first_name: '',
  previous_last_name: '',
  emails: [
    {
      email: 'john@doe.com',
    },
  ],
  phones: [
    {
      phone: '(213) 373 42 53',
      phone_type: 'Mobile',
    },
  ],
}

export const appointmentExample: AppointmentInput = {
  scheduled_date: '2023-04-07T10:15:00Z',
  duration: 15,
  reason: 'Follow-Up',
  description: 'follow up to procedure',
  service_location: undefined,
  telehealth_details: 'video platform',
  patient: 141375220285441,
  physician: 141127177601026,
  practice: 141127173275652,
  metadata: null,
}

export const physicianResponseExample: PhysicianResponse = {
  id: 1,
  is_active: true,
  practice: 1,
  user_id: 1,
  credentials: undefined,
  email: 'test@test.com',
  first_name: 'First',
  last_name: 'Last',
  license: '1',
  license_state: 'NY',
  npi: '1234567890',
  specialty: 'Cardiology',
}

export const nonVisitNoteResponseExample: NonVisitNoteResponse = {
  id: 1,
  type: 'nonvisit',
  bullets: [
    {
      id: 1,
      author: 1,
      category: 'Problem',
      text: 'Test',
      updated_date: '2023-01-01T00:00:00Z',
      version: 2,
    },
  ],
  patient: 1,
  practice: 1,
  chart_date: '2023-01-01T00:00:00Z',
  document_date: '2023-01-01T00:00:00Z',
  tags: [],
}
