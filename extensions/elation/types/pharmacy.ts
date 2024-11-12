import { z } from 'zod'
import { elationMobilePhoneToE164 } from '../utils/elationMobilePhoneToE164'
import { capitalize, upperCase } from 'lodash'

const toTitleCase = (str: string) =>
  str.trim().split(' ').map(capitalize).join(' ')

export const PharmacySchema = z.object({
  ncpdpid: z.string().max(21),
  store_name: z.string().max(105).transform(toTitleCase),
  address_line1: z.string().max(105).transform(toTitleCase),
  address_line2: z.string().max(105).transform(toTitleCase),
  city: z.string().max(105).transform(toTitleCase),
  state: z.string().max(2).transform(upperCase),
  zip: z.string().max(10).transform(toTitleCase),
  phone_primary: z.string().transform(elationMobilePhoneToE164),
  fax: z.string().max(10),
  npi: z.string().max(10),
  active_start_time: z.coerce.date(),
  active_end_time: z.coerce.date(),
  specialty_types: z.string().max(300),
})

export type PharmacyResponse = z.infer<typeof PharmacySchema>
