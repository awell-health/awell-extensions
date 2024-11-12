import { type AppointmentInput } from '../types/appointment'
import { type FindContactsResponse } from '../types/contact'
import { type CreateLabOrderResponse } from '../types/labOrder'
import { type PostLetterResponse } from '../types/letter'
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
  patient_status: {
    status: 'active',
  },
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
  status: {
    status: 'Not Seen',
    room: 'Room 123',
    status_date: '2024-01-01T08:00:00',
    status_detail: 'No show',
  },
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

export const findContactResponseExample: FindContactsResponse = {
  count: 1,
  results: [
    {
      first_name: 'Test',
      id: 141127177601026,
      last_name: 'Doctor',
      middle_name: 'J',
      npi: '2047990827',
      practice: 141127173275652,
      user: 4067,
    },
  ],
}

export const postLetterResponseExample: PostLetterResponse = {
  body: 'This my test',
  id: 142251583930586,
  letter_type: 'provider',
  patient: 141986488057857,
  practice: 141127173275652,
  referral_order: null,
  send_to_contact: {
    id: 141377681883138,
  },
  subject: 'My test subject',
}

export const labOrderResponseExample: CreateLabOrderResponse = {
  confidential: false,
  content: {
    patient_instructions: '',
    test_center_notes: '',
    tests: [
      {
        id: 142255942795326,
      },
    ],
  },
  document_date: '2024-01-25T04:33:40Z',
  id: 142256002957345,
  ordering_physician: 141127177601026,
  patient: 141986488057857,
  practice: 141127173275652,
  site: undefined,
  vendor: 67385753846,
  printable_view:
    'https://sandbox.elationemr.com/api/2.0/lab_orders/142256002957345/printable',
}

export const allergyExample = {
  patientId: 123,
  name: 'Penicillin',
  startDate: '2023-01-01T00:00:00Z',
  reaction: 'Hives',
  severity: 'High',
}

export const historyExample = {
  patientId: 123,
  type: 'Past',
  text: 'Test Past',
}

export const historyResponseExample = {
  id: 64073957420,
  type: 'Diet',
  rank: 1,
  text: 'Yogurt daily',
  patient: 64072843265,
  created_date: '2016-10-13T15:00:38Z',
  deleted_date: null,
}

export const vitalsExample = {
  patientId: 12345,
  practiceId: 67890,
  visitNoteId: 11111,
  bmi: 25.5,
  height: '175',
  weight: '70',
  oxygen: '98',
  rr: '18',
  temperature: '37',
}

export const vitalsResponseExample = {
  id: 65098023184,
  bmi: 21.52,
  height: [
    {
      value: '70',
      units: 'inches',
      note: 'no shoes',
    },
  ],
  weight: [
    {
      value: '150',
      units: 'lbs',
      note: 'in shorts',
    },
  ],
  oxygen: [
    {
      value: '98',
      units: '%',
      note: 'good',
    },
  ],
  rr: [
    {
      value: '20',
      units: 'bpm',
      note: 'deep',
    },
  ],
  hr: [
    {
      value: '60',
      units: 'bpm',
      note: 'calm',
    },
  ],
  hc: [
    {
      value: '30',
      units: 'cm',
      note: 'big',
    },
  ],
  bmi_percentile: '12',
  length_for_weight_percentile: '20',
  patient: 64072843265,
  practice: 65540,
  visit_note: 99024920,
  non_visit_note: null,
  document_date: '2014-01-19T16:00:29Z',
  chart_date: '2014-01-19T16:00:29Z',
  signed_date: '2014-01-19T16:00:29Z',
  signed_by: 131074,
  created_date: '2016-05-02T13:30:07Z',
  deleted_date: null,
}
