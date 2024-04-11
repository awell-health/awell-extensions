import { z } from 'zod'

export const APIRegionSchema = z.enum(['US', 'EU', 'Canada'])
export type APIRegionType = z.infer<typeof APIRegionSchema>

export const baseURLs: Record<APIRegionType, string> = {
  US: 'https://api.talkdeskapp.com/',
  EU: 'https://api.talkdeskapp.eu/',
  Canada: 'https://api.talkdeskappca.com/',
}

export const getAuthUrl = (
  region: APIRegionType,
  talkdeskAccountName: string
): string => {
  if (region === 'US')
    return `https://${talkdeskAccountName}.talkdeskid.com/oauth/token`
  if (region === 'EU')
    return `https://${talkdeskAccountName}.talkdeskid.eu/oauth/token`
  if (region === 'Canada')
    return `https://${talkdeskAccountName}.talkdeskidca.com/oauth/token`

  throw new Error(`Cannot get Talkdesk auth URL for region ${String(region)}`)
}

enum TalkdeskScope {
  AccountRead = 'account:read',
  AppsRead = 'apps:read',
  AppsWrite = 'apps:write',
  AttributesRead = 'attributes:read',
  AttributesWrite = 'attributes:write',
  BulkImportsRead = 'bulk-imports:read',
  BulkImportsWrite = 'bulk-imports:write',
  CallbackWrite = 'callback:write',
  CampaignsRead = 'campaigns:read',
  CampaignsWrite = 'campaigns:write',
  CasesPublicWrite = 'cases-public:write',
  CaseFieldsPublicWrite = 'case-fields-public:write',
  CasesPublicRead = 'cases-public:read',
  ContactsRead = 'contacts:read',
  ContactsWrite = 'contacts:write',
  CfmPublicWrite = 'cfm-public:write',
  DoNotCallListsManage = 'do-not-call-lists:manage',
  DataReportsWrite = 'data-reports:write',
  DataReportsRead = 'data-reports:read',
  EventsWrite = 'events:write',
  ContinuitySettingsActivationWrite = 'continuity-settings-activation:write',
  ContinuitySettingsActivationRead = 'continuity-settings-activation:read',
  FlowsInteractionsStart = 'flows-interactions:start',
  GuardianCasesRead = 'guardian-cases:read',
  GuardianSessionRead = 'guardian-session:read',
  GuardianUsersRead = 'guardian-users:read',
  GuardianCallQualityRead = 'guardian-call-quality:read',
  IdentityActivityRead = 'identity-activity:read',
  LiveQueriesRead = 'live-queries:read',
  LiveSubscriptionsRead = 'live-subscriptions:read',
  LiveSubscriptionsWrite = 'live-subscriptions:write',
  PromptsWrite = 'prompts:write',
  PromptsDelete = 'prompts:delete',
  PromptsRead = 'prompts:read',
  IdentityPhoneValidationRead = '`identity-phone-validation:read',
  RecordingsRead = 'recordings:read',
  RecordListsManage = 'record-lists:manage',
  ReportsWrite = 'reports:write',
  ReportsRead = 'reports:read',
  RingGroupsRead = 'ring-groups:read',
  UserRingGroupsRead = 'user-ring-groups:read',
  SimulatedEmailsWrite = 'simulated-emails:write',
  WfmAionPublicWrite = 'wfm-aion-public:write',
  UsersRead = 'users:read',
  AccountWalletsRead = 'account-wallets:read',
  BucketConfigurationsRead = 'bucket-configurations:read',
  VoiceBiometricsConsentWrite = 'voicebiometrics-consent:write',
  VoiceBiometricsConsentRead = 'voicebiometrics-consent:read',
  VoiceBiometricsEnrollWrite = 'voicebiometrics-enroll:write',
  WebhooksTriggerWrite = 'webhooks-trigger:write',
  WebhooksTriggerRead = 'webhooks-trigger:read',
}

/**
 * The scopes we need in order to be able
 * to execute all actions in this extension
 */
const scopesArray = [
  TalkdeskScope.FlowsInteractionsStart,
  TalkdeskScope.ContactsRead,
  TalkdeskScope.ContactsWrite,
]

export const scope = scopesArray.join(' ')
