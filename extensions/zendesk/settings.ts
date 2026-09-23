import { type Setting } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { z } from 'zod'

/**
 * Zendesk is removing API tokens as an authentication method:
 * - Accounts created on or after 2026-07-28 cannot create API tokens.
 * - From 2026-10-27 no account can create new API tokens.
 * - On 2027-04-30 all API tokens stop working.
 * https://support.zendesk.com/hc/en-us/articles/10840968198042
 *
 * The extension therefore supports two authentication methods:
 * 1. OAuth client credentials (recommended): an OAuth client created in
 *    Zendesk Admin Center. The extension exchanges the identifier and secret
 *    for short-lived bearer tokens.
 * 2. User email + API token (legacy): kept so existing installs keep working
 *    until Zendesk deactivates API tokens.
 */
export const settings = {
  subdomain: {
    label: 'Zendesk Subdomain',
    key: 'subdomain',
    obfuscated: false,
    required: true,
    description:
      'Your Zendesk subdomain only (e.g., "company" for company.zendesk.com). Do not include ".zendesk.com".',
  },
  oauth_client_id: {
    label: 'OAuth Client Identifier',
    key: 'oauth_client_id',
    obfuscated: false,
    required: false,
    description:
      'Recommended. The "Unique identifier" of a confidential OAuth client created in Zendesk Admin Center under Apps and integrations > APIs > OAuth clients. Used together with the OAuth Client Secret; when both are set, the User Email and API Token are ignored. API calls are attributed to the Zendesk user who created the OAuth client.',
  },
  oauth_client_secret: {
    label: 'OAuth Client Secret',
    key: 'oauth_client_secret',
    obfuscated: true,
    required: false,
    description:
      'The secret of the OAuth client. Zendesk shows it only once, when the client is created.',
  },
  user_email: {
    label: 'User Email',
    key: 'user_email',
    obfuscated: false,
    required: false,
    description:
      'Legacy. Your Zendesk user email address, used together with an API Token. Zendesk deactivates all API tokens on April 30, 2027; prefer the OAuth settings.',
  },
  api_token: {
    label: 'API Token',
    key: 'api_token',
    obfuscated: true,
    required: false,
    description:
      'Legacy. Your Zendesk API token, used together with the User Email. Zendesk deactivates all API tokens on April 30, 2027; prefer the OAuth settings.',
  },
} satisfies Record<string, Setting>

const isBlank = (value: string | undefined): boolean =>
  isNil(value) || value.trim().length === 0

const optionalString = z
  .string()
  .optional()
  .transform((value) => (isBlank(value) ? undefined : value?.trim()))

export const MISSING_CREDENTIALS_MESSAGE =
  'Missing Zendesk credentials in the extension settings. Provide either an "OAuth Client Identifier" and "OAuth Client Secret" (recommended), or a "User Email" and "API Token".'

export const SettingsValidationSchema = z
  .object({
    subdomain: z
      .string({
        error: 'Missing "Zendesk Subdomain" in the extension settings.',
      })
      .trim()
      .nonempty({
        error: 'Missing "Zendesk Subdomain" in the extension settings.',
      })
      // Tolerate a full host being pasted in ("company.zendesk.com").
      .transform((value) =>
        value.replace(/^https?:\/\//, '').replace(/\.zendesk\.com.*$/i, ''),
      ),
    oauth_client_id: optionalString,
    oauth_client_secret: optionalString,
    user_email: optionalString,
    api_token: optionalString,
  })
  .superRefine((value, ctx) => {
    const hasOauth =
      !isNil(value.oauth_client_id) || !isNil(value.oauth_client_secret)

    if (hasOauth) {
      if (isNil(value.oauth_client_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['oauth_client_id'],
          message:
            'Missing "OAuth Client Identifier" in the extension settings.',
        })
      }
      if (isNil(value.oauth_client_secret)) {
        ctx.addIssue({
          code: 'custom',
          path: ['oauth_client_secret'],
          message: 'Missing "OAuth Client Secret" in the extension settings.',
        })
      }
      return
    }

    if (isNil(value.user_email) && isNil(value.api_token)) {
      ctx.addIssue({
        code: 'custom',
        path: ['api_token'],
        message: MISSING_CREDENTIALS_MESSAGE,
      })
      return
    }

    if (!z.email().safeParse(value.user_email).success) {
      ctx.addIssue({
        code: 'custom',
        path: ['user_email'],
        message: 'Invalid "User Email" in the extension settings.',
      })
    }

    if (isNil(value.api_token)) {
      ctx.addIssue({
        code: 'custom',
        path: ['api_token'],
        message: 'Missing "API Token" in the extension settings.',
      })
    }
  })

export type ValidatedSettings = z.infer<typeof SettingsValidationSchema>
