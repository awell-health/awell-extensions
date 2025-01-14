import { type GetReferralOrderResponseType } from 'extensions/elation/types/referralOrder'

export const referralOrderMockResponse = {
  id: 142687932973088,
  authorization_for: 'Referral For Treatment, includes Consult Visit',
  auth_number: '',
  consultant_name: 'Pharmacy (Suvida)',
  short_consultant_name: '',
  specialty: null,
  date_for_reEval: null,
  authorization_for_short: null,
  practice: 141114865745924,
  patient: 141624181522433,
  letter: 142687933038810,
  resolution: null,
  icd10_codes: [
    {
      code: 'E11.9',
      description: 'Type 2 diabetes mellitus without complications',
    },
    {
      code: 'Z71.89',
      description: 'Other specified counseling',
    },
  ],
} satisfies GetReferralOrderResponseType
