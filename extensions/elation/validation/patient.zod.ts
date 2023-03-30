import { z } from 'zod'

// Enums
const genderIdentityEnum = z.enum([
  'unknown',
  'man',
  'woman',
  'transgender_man',
  'transgender_woman',
  'nonbinary',
  'option_not_listed',
  'prefer_not_to_say',
  'two_spirit'
]).default('unknown')

const legalGenderMarkerEnum = z.enum(['M', 'F', 'X', 'U'])

const pronounsEnum = z.enum([
  'he_him_his',
  'she_her_hers',
  'they_them_theirs',
  'not_listed'
])

const sexEnum = z.enum([
  'Male',
  'Female',
  'Other',
  'Unknown'
])

const sexualOrientationEnum = z.enum([
  'unknown',
  'straight',
  'gay',
  'bisexual',
  'option_not_listed',
  'prefer_not_to_say',
  'lesbian',
  'queer',
  'asexual'
]).default("unknown")

const raceEnum = z.enum([
  'No race specified',
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other',
  'Declined to specify'
]).default('No race specified')

const ethnicityEnum = z.enum([
  'No ethnicity specified',
  'Hispanic or Latino',
  'Not Hispanic or Latino',
  'Unknown',
  'Declined to specify'
]).default('No ethnicity specified')

const phoneTypeEnum = z.enum([
  'Home',
  'Mobile',
  'Main',
  'Work',
  'Night',
  'Fax',
  'Other'
])

const relationshipEnum = z.enum([
  'Caregiver',
  'Child',
  'Friend',
  'Grandparent',
  'Guardian',
  'Parent',
  'Sibling',
  'Spouse',
  'Other'
]);

const insuranceRankEnum = z.enum([
  'primary',
  'secondary',
  'tertiary'
])

const inactiveReasonEnum = z.enum([
  'other',
  'patient left on bad terms',
  'patient left on good terms',
  'practice ended relationship',
  'unknown'
])

const patientStatusEnum = z.enum([
  'active',
  'deceased',
  'inactive',
  'prospect'
])

// Schemas
const addressSchema = z.object({
  address_line1: z.string().max(200),
  address_line2: z.string().max(35).nullish(),
  city: z.string().max(50),
  state: z.string().max(2),
  zip: z.string().max(9)
})

export const phoneSchema = z.object({
  phone: z.string().max(20),
  phone_type: phoneTypeEnum,
})

export const emailSchema = z.object({
  email: z.string().email().max(75),
})

export const guarantorSchema = z.object({
  address: z.string().max(200),
  city: z.string().max(50),
  state: z.string().max(2),
  zip: z.string().max(9),
  phone: z.string().max(20),
  relationship: relationshipEnum,
  first_name: z.string().max(70),
  last_name: z.string().max(70),
  middle_name: z.string().max(50).nullish(),
})

export const insuranceSchema = z.object({
  rank: insuranceRankEnum,
  carrier: z.string().max(200),
  member_id: z.string().max(50),
  group_id: z.string().max(50),
  plan: z.string().max(200),
  phone: z.string().max(20),
  extension: z.string().max(6),
  address: z.string().max(200),
  suite: z.string().max(35).nullish(),
  city: z.string().max(50),
  state: z.string().max(2),
  zip: z.string().max(9),
  copay: z.number().nullish(),
  deductible: z.number().nullish(),
})

export const patientStatusSchema = z.object({
  deceased_date: z.string().nullish(),
  inactive_reason: inactiveReasonEnum.nullish(),
  notes: z.string().nullish(),
  status: patientStatusEnum
})

const preferenceSchema = z.object({
  preferred_pharmacy_1: z.string().nullish(),
  preferred_pharmacy_2: z.string().nullish()
})

const emergencyContactSchema = z.object({
  first_name: z.string().max(70),
  last_name: z.string().max(70),
  relationship: relationshipEnum,
  phone: z.string().max(20),
  address_line1: z.string().max(200),
  address_line2: z.string().max(35),
  city: z.string().max(50),
  state: z.string().max(2),
  zip: z.string().max(10)
})

export const consentSchema = z.object({
  consented: z.boolean(),
  application: z.string().max(255)
})

const employerSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string()
})

export const patientSchema = z.object({
  first_name: z.string().max(70), // required for POST and PUT
  middle_name: z.string().max(50).nullish(),
  last_name: z.string().max(70), // required for POST and PUT
  actual_name: z.string().max(150).nullish(),
  gender_identity: genderIdentityEnum.nullish(),
  legal_gender_marker: legalGenderMarkerEnum.nullish(),
  pronouns: pronounsEnum.nullish(),
  sex: sexEnum, // required for POST and PUT
  sexual_orientation: sexualOrientationEnum.nullish(),
  primary_physician: z.coerce.number().int().positive(), // required for POST and PUT
  caregiver_practice: z.coerce.number().int().positive(), // required for POST and PUT
  dob: z.coerce.date().transform(arg => arg.toISOString().slice(0, 10)), // required for POST and PUT
  ssn: z.string().length(9).nullish(),
  race: raceEnum.nullish(),
  preferred_language: z.string().nullish(),
  ethnicity: ethnicityEnum.nullish(),
  notes: z.string().max(500).nullish(),
  vip: z.boolean().default(false),
  address: addressSchema.nullish(),
  phones: z.array(phoneSchema).max(2).default([]).nullish(),
  emails: z.array(emailSchema).default([]).nullish(),
  guarantor: guarantorSchema.nullish(),
  insurances: z.array(insuranceSchema).default([]).nullish(),
  deleted_insurances: z.array(insuranceSchema).default([]).nullish(),
  tags: z.array(z.string().max(100)).max(10).default([]).nullish(),
  patient_status: patientStatusSchema.nullish(),
  preference: preferenceSchema.nullish(),
  emergency_contact: emergencyContactSchema.nullish(),
  primary_care_provider_npi: z.string().length(10).nullish(),
  previous_first_name: z.string().max(70).nullish(),
  previous_last_name: z.string().max(70).nullish(),
  master_patient: z.number().int().positive().nullish(), // ? type not in docs
  employer: employerSchema.nullish(),
  consents: z.array(consentSchema).default([]).nullish(),
  metadata: z.object({}).passthrough().nullish(),
})

export const updatePatientSchema = patientSchema.extend({
  patient_id: z.coerce.number().positive()
})
