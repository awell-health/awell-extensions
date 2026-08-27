import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'
import { FromNameValidationSchema } from './v1/validation'

export const settings = {
  productToken: {
    label: 'Product Token',
    key: 'productToken',
    obfuscated: true,
    required: true,
    description:
      'This is the product token for authentication. Visit https://gateway.cmtelecom.com/ to retrieve your product token.',
  },
  fromName: {
    label: 'From/sender name',
    key: 'fromName',
    obfuscated: false,
    required: false,
    description:
      "This is the sender's name. The maximum length is 11 alphanumerical characters or 16 digits",
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  productToken: z.string().nonempty({
    error: 'Missing "product token in the extension settings."',
  }),
  fromName: FromNameValidationSchema,
} satisfies Record<keyof typeof settings, ZodType>)
