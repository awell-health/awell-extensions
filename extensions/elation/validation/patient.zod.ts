import { DateOnlySchema, NumericIdSchema } from '@awell-health/extensions-core'
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
  'two_spirit',
])

const legalGenderMarkerEnum = z.enum(['M', 'F', 'X', 'U'])

const pronounsEnum = z.enum([
  'he_him_his',
  'she_her_hers',
  'they_them_theirs',
  'not_listed',
])

const sexEnum = z.enum(['Male', 'Female', 'Other', 'Unknown'])

const sexualOrientationEnum = z.enum([
  'unknown',
  'straight',
  'gay',
  'bisexual',
  'option_not_listed',
  'prefer_not_to_say',
  'lesbian',
  'queer',
  'asexual',
])

const raceEnum = z.enum([
  'No race specified',
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other',
  'Declined to specify',
])

const ethnicityEnum = z.enum([
  'No ethnicity specified',
  'Hispanic or Latino',
  'Not Hispanic or Latino',
  'Unknown',
  'Declined to specify',
])

const phoneTypeEnum = z.enum([
  'Home',
  'Mobile',
  'Main',
  'Work',
  'Night',
  'Fax',
  'Other',
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
  'Other',
])

const insuranceRankEnum = z.enum(['primary', 'secondary', 'tertiary'])

const paymentProgramEnum = z.enum([
  'Medicare Part B',
  'Medicare Advantage',
  'Medicaid',
  'Commercial - HMSA',
  'Commercial - SFHP',
  'Commercial - Other',
  "Worker's Compensation",
])

const inactiveReasonEnum = z.enum([
  'other',
  'patient left on bad terms',
  'patient left on good terms',
  'practice ended relationship',
  'unknown',
])

const patientStatusEnum = z.enum(['active', 'deceased', 'inactive', 'prospect'])

// Schemas
const addressSchema = z.object({
  address_line1: z.string().max(200),
  address_line2: z.string().max(35).nullish(),
  city: z.string().max(50),
  state: z.string().max(2),
  zip: z.string().max(9),
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
  phone: z.string().max(20).nullish(),
  relationship: relationshipEnum.nullish(),
  first_name: z.string().max(70).nullish(),
  last_name: z.string().max(70).nullish(),
  middle_name: z.string().max(50).nullish(),
})

export const insuranceSchema = z.object({
  rank: insuranceRankEnum,
  carrier: z.string().max(200).nullish(),
  member_id: z.string().max(50).nullish(),
  group_id: z.string().max(50).nullish(),
  plan: z.string().max(200).nullish(),
  phone: z.string().max(20).nullish(),
  extension: z.string().max(6).nullish(),
  address: z.string().max(200).nullish(),
  suite: z.string().max(35).nullish(),
  city: z.string().max(50).nullish(),
  state: z.string().max(2).nullish(),
  zip: z.string().max(9).nullish(),
  copay: z.number().nullish(),
  deductible: z.number().nullish(),
  payment_program: paymentProgramEnum.nullish(),
  insured_person_first_name: z.string().max(200).nullish(),
  insured_person_last_name: z.string().max(200).nullish(),
  insured_person_address: z.string().max(200).nullish(),
  insured_person_city: z.string().max(50).nullish(),
  insured_person_state: z.string().max(2).nullish(),
  insured_person_zip: z.string().max(9).nullish(),
  insured_person_id: z.string().max(50).nullish(),
  insured_person_dob: DateOnlySchema.nullish(),
  insured_person_gender: legalGenderMarkerEnum.nullish(),
  insured_person_ssn: z.string().max(9).nullish(),
  relationship_to_insured: z.string().max(20).nullish(),
})

export const patientStatusSchema = z.object({
  deceased_date: DateOnlySchema.nullish(),
  inactive_reason: inactiveReasonEnum.nullish(),
  notes: z.string().nullish(),
  status: patientStatusEnum,
})

const preferenceSchema = z.object({
  preferred_pharmacy_1: z.string().nullish(),
  preferred_pharmacy_2: z.string().nullish(),
})

const emergencyContactSchema = z.object({
  first_name: z.string().max(70).nullish(),
  last_name: z.string().max(70).nullish(),
  relationship: relationshipEnum.nullish(),
  phone: z.string().max(20).nullish(),
  address_line1: z.string().max(200).nullish(),
  address_line2: z.string().max(35).nullish(),
  city: z.string().max(50).nullish(),
  state: z.string().max(2).nullish(),
  zip: z.string().max(10).nullish(),
})

const employerSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
})

export const patientSchema = z
  .object({
    first_name: z.string().max(70), // required for POST and PUT
    middle_name: z.string().max(50).nullish(),
    last_name: z.string().max(70), // required for POST and PUT
    actual_name: z.string().max(150).nullish(),
    gender_identity: genderIdentityEnum.nullish(),
    legal_gender_marker: legalGenderMarkerEnum.nullish(),
    pronouns: pronounsEnum.nullish(),
    sex: sexEnum, // required for POST and PUT
    sexual_orientation: sexualOrientationEnum.nullish(),
    primary_physician: NumericIdSchema, // required for POST and PUT
    caregiver_practice: NumericIdSchema, // required for POST and PUT
    preferred_service_location: NumericIdSchema.optional().nullish(),
    dob: DateOnlySchema, // required for POST and PUT
    ssn: z.string().length(9).nullish(),
    race: raceEnum.nullish(),
    preferred_language: z.string().nullish(),
    ethnicity: ethnicityEnum.nullish(),
    notes: z.string().max(500).nullish(),
    vip: z.boolean().nullish(),
    address: addressSchema.strict().nullish(),
    phones: z.array(phoneSchema.strict()).max(2).nullish(),
    emails: z.array(emailSchema.strict()).nullish(),
    guarantor: guarantorSchema.strict().nullish(),
    insurances: z.array(insuranceSchema.strict()).nullish(),
    deleted_insurances: z.array(insuranceSchema.strict()).nullish(),
    tags: z.array(z.string().max(100)).max(10).nullish(),
    patient_status: patientStatusSchema.strict().nullish(),
    preference: preferenceSchema.strict().nullish(),
    emergency_contact: emergencyContactSchema.strict().nullish(),
    primary_care_provider_npi: z.string().length(10).nullish(),
    previous_first_name: z.string().max(70).nullish(),
    previous_last_name: z.string().max(70).nullish(),
    master_patient: NumericIdSchema.nullish(), // ? type not in docs
    employer: employerSchema.strict().nullish(),
    metadata: z.object({}).passthrough().nullish(),
  })
  .strict()

export const updatePatientSchema = z
  .object({
    first_name: z.string().max(70).nullish(),
    middle_name: z.string().max(50).nullish(),
    last_name: z.string().max(70).nullish(),
    actual_name: z.string().max(150).nullish(),
    gender_identity: genderIdentityEnum.nullish(),
    legal_gender_marker: legalGenderMarkerEnum.nullish(),
    pronouns: pronounsEnum.nullish(),
    sex: sexEnum.nullish(),
    sexual_orientation: sexualOrientationEnum.nullish(),
    primary_physician: NumericIdSchema.nullish(),
    caregiver_practice: NumericIdSchema.nullish(),
    dob: DateOnlySchema.nullish(),
    ssn: z.string().length(9).nullish(),
    race: raceEnum.nullish(),
    preferred_language: z.string().nullish(),
    ethnicity: ethnicityEnum.nullish(),
    notes: z.string().max(500).nullish(),
    vip: z.boolean().nullish(),
    address: addressSchema.strict().nullish(),
    phones: z.array(phoneSchema.strict()).max(2).nullish(),
    emails: z.array(emailSchema.strict()).nullish(),
    guarantor: guarantorSchema.strict().nullish(),
    insurances: z.array(insuranceSchema.strict()).nullish(),
    deleted_insurances: z.array(insuranceSchema.strict()).nullish(),
    tags: z.array(z.string().max(100)).max(10).nullish(),
    patient_status: patientStatusSchema.strict().nullish(),
    preference: preferenceSchema.strict().nullish(),
    emergency_contact: emergencyContactSchema.strict().nullish(),
    primary_care_provider_npi: z.string().length(10).nullish(),
    previous_first_name: z.string().max(70).nullish(),
    previous_last_name: z.string().max(70).nullish(),
    master_patient: NumericIdSchema.nullish(), // ? type not in docs
    employer: employerSchema.strict().nullish(),
    metadata: z.object({}).passthrough().nullish(),
  })
  .strict()
