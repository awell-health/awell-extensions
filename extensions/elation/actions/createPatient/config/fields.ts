import { z, type ZodTypeAny } from 'zod'
import {
  DateOnlySchema,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import { type Field, StringType } from '@awell-health/extensions-core'
import {
  genderIdentityEnum,
  legalGenderMarkerEnum,
  pronounsEnum,
  sexEnum,
  sexualOrientationEnum,
  ethnicityEnum,
  raceEnum,
} from '../../../validation/patient.zod'
import { isEmpty, isNil, startCase } from 'lodash'
import { optionalEmailSchema } from '../../../../../src/utils/emailValidation'

export const fields = {
  firstName: {
    id: 'firstName',
    label: 'First name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: '',
    type: FieldType.DATE,
    required: true,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: "Possible values are 'Male', 'Female', 'Other', 'Unknown'",
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(sexEnum.enum).map((sex) => ({
        label: sex,
        value: sex,
      })),
    },
  },
  primaryPhysicianId: {
    id: 'primaryPhysicianId',
    label: 'Primary Physician ID',
    description: 'The ID of the primary physician associated to the patient',
    type: FieldType.NUMERIC,
    required: true,
  },
  caregiverPracticeId: {
    id: 'caregiverPracticeId',
    label: 'Caregiver Practice ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  mobilePhone: {
    id: 'mobilePhone',
    label: 'Mobile phone',
    description: 'The number will be stored in US national format in Elation',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  middleName: {
    id: 'middleName',
    label: 'Middle Name',
    description: '',
    type: FieldType.STRING,
  },
  actualName: {
    id: 'actualName',
    label: 'Actual Name',
    description: '',
    type: FieldType.STRING,
  },
  genderIdentity: {
    id: 'genderIdentity',
    label: 'Gender identity',
    description:
      "Possible values are 'unknown', 'man', 'woman', 'transgender_man', 'transgender_woman', 'nonbinary', 'option_not_listed', 'prefer_not_to_say', 'two_spirit'",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(genderIdentityEnum.enum).map(
        (genderIdentity) => ({
          label: startCase(genderIdentity),
          value: genderIdentity,
        }),
      ),
    },
  },
  legalGenderMarker: {
    id: 'legalGenderMarker',
    label: 'Legal gender marker',
    description: "Possible values are 'M', 'F', 'X', 'U'",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(legalGenderMarkerEnum.enum).map(
        (legalGenderMarker) => ({
          label: startCase(legalGenderMarker),
          value: legalGenderMarker,
        }),
      ),
    },
  },
  pronouns: {
    id: 'pronouns',
    label: 'Pronouns',
    description:
      "Pronouns by which a patient identifies self. Possible values are 'he_him_his', 'she_her_hers', 'they_them_theirs', 'not_listed'",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(pronounsEnum.enum).map((pronouns) => ({
        label: startCase(pronouns),
        value: pronouns,
      })),
    },
  },
  sexualOrientation: {
    id: 'sexualOrientation',
    label: 'Sexual orientation',
    description:
      "Possible values are 'unknown', 'straight', 'gay', 'bisexual', 'option_not_listed', 'prefer_not_to_say', 'lesbian', 'queer', 'asexual'",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(sexualOrientationEnum.enum).map(
        (sexualOrientation) => ({
          label: startCase(sexualOrientation),
          value: sexualOrientation,
        }),
      ),
    },
  },
  ssn: {
    id: 'ssn',
    label: 'SSN',
    description: 'The Social Security number of the patient',
    type: FieldType.STRING,
  },
  ethnicity: {
    id: 'ethnicity',
    label: 'Ethnicity',
    description:
      "Possible values are 'No ethnicity specified', 'Hispanic or Latino', 'Not Hispanic or Latino', 'Declined to specify'.",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(ethnicityEnum.enum).map((ethnicity) => ({
        label: startCase(ethnicity),
        value: ethnicity,
      })),
    },
  },
  race: {
    id: 'race',
    label: 'Race',
    description:
      "Possible values are 'No race specified', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Declined to specify'.",
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(raceEnum.enum).map((race) => ({
        label: startCase(race),
        value: race,
      })),
    },
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred language',
    description: "Full names e.g. 'English', 'Spanish' or 'French'.",
    type: FieldType.STRING,
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    description: 'Additional notes about the patient',
    type: FieldType.STRING,
  },
  previousFirstName: {
    id: 'previousFirstName',
    label: 'Previous first name',
    description: 'The previous first name of the patient',
    type: FieldType.STRING,
  },
  previousLastName: {
    id: 'previousLastName',
    label: 'Previous last name',
    description: 'The previous last name of the patient',
    type: FieldType.STRING,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description:
      'The tags associated with the patient. Separate multiple tags with a comma (max 10 per patient).',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: DateOnlySchema,
  sex: sexEnum,
  primaryPhysicianId: NumericIdSchema,
  caregiverPracticeId: NumericIdSchema,
  email: optionalEmailSchema,
  mobilePhone: z.string().optional(),
  middleName: z.string().optional(),
  actualName: z.string().optional(),
  genderIdentity: genderIdentityEnum.optional(),
  legalGenderMarker: legalGenderMarkerEnum.optional(),
  pronouns: pronounsEnum.optional(),
  sexualOrientation: sexualOrientationEnum.optional(),
  ssn: z.string().optional(),
  ethnicity: ethnicityEnum.optional(),
  race: raceEnum.optional(),
  preferredLanguage: z.string().optional(),
  notes: z.string().optional(),
  previousFirstName: z.string().optional(),
  previousLastName: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((tags) => {
      if (isNil(tags) || isEmpty(tags)) {
        return undefined
      }

      return tags
        .trim()
        .split(',')
        .map((tag) => tag.trim())
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
