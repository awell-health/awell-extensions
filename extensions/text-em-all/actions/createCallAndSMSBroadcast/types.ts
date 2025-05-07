import { z } from 'zod'

export const MixedBroadcastTypes = z.enum([
  'SMSAndAnnouncement',
  'SMSAndSurvey',
  'SMSOrAnnouncement',
  'SMSOrSurvey',
])
