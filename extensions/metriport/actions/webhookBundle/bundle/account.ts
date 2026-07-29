import { type BundleEntry, type Organization } from '@medplum/fhirtypes'
import {
  ACCOUNT_ORGANIZATION_FULL_URL,
  METRIPORT_ACCOUNT_ORGANIZATION_NAME,
} from './constants'

/**
 * The Organization used as the account for imported resources.
 *
 * POST with `ifNoneExist` rather than a conditional update: if the organization
 * already exists the create is skipped and the `fullUrl` resolves to the
 * existing resource, so we never overwrite contents we don't own. `Provenance`
 * references this entry as the assembling agent.
 */
export const buildAccountOrganizationEntry = (): BundleEntry<Organization> => ({
  fullUrl: ACCOUNT_ORGANIZATION_FULL_URL,
  resource: {
    resourceType: 'Organization',
    name: METRIPORT_ACCOUNT_ORGANIZATION_NAME,
  },
  request: {
    method: 'POST',
    url: 'Organization',
    ifNoneExist: `name:exact=${METRIPORT_ACCOUNT_ORGANIZATION_NAME}`,
  },
})
