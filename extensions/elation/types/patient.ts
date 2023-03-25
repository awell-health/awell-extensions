// enum PatientGenderIdentity {
//   'unknown',
//   'man',
//   'woman',
//   'transgender_man',
//   'transgender_woman',
//   'nonbinary',
//   'option_not_listed',
//   'prefer_not_to_say',
//   'two_spirit',
// }

// enum PatientLegalGenderMarker {
//   'M',
//   'F',
//   'X',
//   'U',
// }

// enum PatientPronouns {
//   'he_him_his',
//   'she_her_hers',
//   'they_them_theirs',
//   'not_listed',
// }

// enum PatientSexualOrientation {
//   'unknown',
//   'straight',
//   'gay',
//   'bisexual',
//   'option_not_listed',
//   'prefer_not_to_say',
//   'lesbian',
//   'queer',
//   'asexual',
// }

export interface Patient {
  id?: number
  first_name: string
  middle_Name?: string
  last_name: string
  //   actual_name?: string
  //   gender_identity?: string
  //   legal_gender_marker?: string
  //   pronouns?: string
  //   sexual_orientation?: string
  primary_physician: number
  caregiver_practice: number
  dob: string
  [key: string]: any
}

export const patientExample: Patient = {
  id: 64184451073, // long(64)  read-only
  first_name: 'Paula', // string(70)  required for POST and PUT
  middle_name: 'P', // string(50)
  last_name: 'Patient', // string(70)  required for POST and PUT
  actual_name: 'Paul Patient', // string(150) optional for POST or PUT
  gender_identity: 'woman', // ["unknown", "man", "woman", "transgender_man", "transgender_woman", "nonbinary", "option_not_listed", "prefer_not_to_say", "two_spirit"] optional for POST or PUT
  legal_gender_marker: 'F', // ["M", "F", "X", "U"] optional for POST or PUT
  pronouns: 'he_him_his', // ["he_him_his", "she_her_hers", "they_them_theirs", "not_listed"] optional for POST and PUT
  sex: 'Female', // ["Male", "Female", "Other", "Unknown"]  required for POST and PUT
  sexual_orientation: 'queer', // ["unknown", "straight", "gay", "bisexual", "option_not_listed", "prefer_not_to_say", "lesbian", "queer", "asexual"] optional for POST or PUT
  primary_physician: 131074, // required for POST and PUT, see below
  caregiver_practice: 65540, // read-only. required for POST and PUT
  dob: '1940-08-29', // date(YYYY-MM-DD)  required for POST and PUT
  ssn: '123456789', // integer(9 digits)
  race: 'Asian', // see below
  preferred_language: 'English', // see below
  ethnicity: 'Not Hispanic or Latino', // see below
  notes: 'This is test Notes', // string(500)
  vip: false, // feature must be enabled for practice
  address: {
    address_line1: '550 15th Street', // string(200)
    address_line2: '21', // string(35)
    city: 'San Francisco', // string(50)
    state: 'CA', // string(2)
    zip: '94103', // integer(9 digits)
  },
  phones: [
    // list of objects. max 2 phones
    {
      phone: '4155555555', // string(20)
      phone_type: 'Home', // see below
      created_date: '2016-10-10T23:31:49', // datetime(iso8601)  read-only
      deleted_date: null, // datetime(iso8601)  read-only
    },
  ],
  emails: [
    // list of objects. only 1 email with empty deleted_date
    {
      email: 'paul.patient@elationemr.com', // string(75)
      created_date: '2016-10-10T23:31:49', // datetime(iso8601)  read-only
      deleted_date: null, // datetime(iso8601)  read-only
    },
  ],
  guarantor: {
    id: 123456789,
    address: '101 Lane Street',
    city: 'Madison',
    state: 'WI',
    zip: '53711',
    phone: '1231231233',
    relationship: 'Other', // {"Spouse", "Child", "Other"}
    first_name: 'Other',
    last_name: 'Test',
    middle_name: null,
  },
  insurances: [
    // list of objects. max 2 insurances
    {
      id: 140767609356371,
      insurance_company: 70970048878, // from Insurance Company resource
      insurance_plan: 70971687279, // from Insurance Plan resource
      rank: 'primary', // ["primary", "secondary", "tertiary"]
      carrier: 'Blue Cross', // string(200)
      member_id: 'test_member_id', // string(50)
      group_id: 'test_group_id', // string(50)
      plan: 'Blue Cross Blue Shield', // string(200)
      phone: '', // string(20)
      extension: '', // string(6)
      address: '123 medicare st', // string(200)
      suite: null, // string(35)
      city: 'San Francisco', // string(50)
      state: 'CA', // string(2)
      zip: '94104', // integer(9 digits)
      copay: null, // decimal
      deductible: null, // decimal
      payment_program: 'Commercial - Other', // ["Medicare Part B", "Medicare Advantage", "Medicaid", "Commercial - HMSA", "Commercial - SFHP", "Commercial - Other", "Worker's Compensation"]
      insured_person_first_name: 'Paula', // string(200)
      insured_person_last_name: 'Patient', // string(200)
      insured_person_address: '550 15th St', // string(200)
      insured_person_city: 'San Francisco', // string(50)
      insured_person_state: 'CA', // string(2)
      insured_person_zip: '94013', // integer(9 digits)
      insured_person_id: '12345', // string(50)
      insured_person_dob: '08/29/1940', // string(50)
      insured_person_gender: 'F', // ["M", "F", "N"]
      insured_person_ssn: '123456789', // integer(9 digits)
      relationship_to_insured: null, // string(20)
      created_date: '2020-05-12T22:52:25Z', // datetime(iso8601). read-only
      deleted_date: null, // datetime(iso8601). read-only
    },
  ],
  deleted_insurances: [
    // list of objects, max 5 deleted insurances
    {
      id: 140745403531347,
      insurance_company: 140744693383534, // from Insurance Company resource
      insurance_plan: 140745403466095, // from Insurance Plan resource
      rank: 'secondary', // ["primary", "secondary", "tertiary"]
      carrier: 'PBMX', // string(200)
      member_id: 'test_member_id', // string(50)
      group_id: 'test_group_id', // string(50)
      plan: 'PBMX Test Plan', // string(200)
      phone: '', // string(20)
      extension: '', // string(6)
      address: '', // string(200)
      suite: null, // string(35)
      city: 'San Francisco', // string(50)
      state: 'CA', // string(2)
      zip: '94107', // integer(9 digits)
      copay: null, // decimal
      deductible: null, // decimal
      payment_program: 'Commercial - Other', // ["Medicare Part B", "Medicare Advantage", "Medicaid", "Commercial - HMSA", "Commercial - SFHP", "Commercial - Other", "Worker's Compensation"]
      insured_person_first_name: 'Paula', // string(200)
      insured_person_last_name: 'Patient', // string(200)
      insured_person_address: '550 15th St', // string(200)
      insured_person_city: 'San Francisco', // string(50)
      insured_person_state: 'CA', // string(2)
      insured_person_zip: '94013', // integer(9 digits)
      insured_person_id: '12345', // string(50)
      insured_person_dob: '08/29/1940', // string(50)
      insured_person_gender: 'F', // ["M", "F"]
      insured_person_ssn: '123456789', // integer(9 digits)
      relationship_to_insured: null, // string(20)
      created_date: '2020-05-12T22:52:25Z', // datetime(iso8601). read-only
      deleted_date: '2021-04-28T10:50:22Z', // datetime(iso8601). read-only
    },
  ],
  tags: [
    // list of string(100), max 10 tags
    'PAID',
    'Test Patient',
  ],
  patient_status: {
    deceased_date: null, // datetime(iso8601)
    inactive_reason: null, // ["other", "patient left on bad terms", "patient left on good terms", "practice ended relationship", "unknown"]
    last_status_change: '2022-08-24T13:03:05', // datetime(iso8601). read-only
    notes: 'my notes', // string
    status: 'active', // ["active", "deceased", "inactive", "prospect"]
  },
  preference: {
    preferred_pharmacy_1: null, // ncpdpid. See "Pharmacy API"
    preferred_pharmacy_2: null,
  },
  emergency_contact: {
    first_name: 'John', // string(70)
    last_name: 'Doe', // string(70)
    relationship: 'Child', // string(30)
    phone: '4151231234', // string(20)
    address_line1: '19 test ave', // string(200)
    address_line2: '#12', // string(35)
    city: 'San Francisco', // string(50)
    state: 'CA', // string(2)
    zip: '123456789', // string(10)
  },
  primary_care_provider: 131074, // read-only, see below
  primary_care_provider_npi: '1234567893', // string(10), see below
  previous_first_name: null, // optional, can be specified
  previous_last_name: null, // optional, can be specified
  master_patient: null,
  employer: {
    // employer field is enterprise use only
    code: 'EMP_1',
    name: 'Employer Name 1',
    description: 'Employer Description 1',
  },
  consents: [
    // list of objects, no max, read-only
    {
      consented: true, // boolean
      last_modified_date: '2016-05-02T11:57:41Z', // datetime(iso8601)
      application: 'healthix', // string(255)
    },
  ],
  metadata: null,
  created_date: '2016-05-02T11:57:41Z', // datetime(iso8601)  read-only
  deleted_date: null, // datetime(iso8601)  read-only
  merged_into_chart: null, // long(64)  read-only
}
