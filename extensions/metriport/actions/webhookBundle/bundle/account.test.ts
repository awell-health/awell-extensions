import { buildAccountOrganizationEntry } from './account'
import {
  ACCOUNT_ORGANIZATION_FULL_URL,
  METRIPORT_ACCOUNT_ORGANIZATION_NAME,
} from './constants'

describe('buildAccountOrganizationEntry', () => {
  test('creates the Organization only when absent, via ifNoneExist', () => {
    const entry = buildAccountOrganizationEntry()

    expect(entry.request).toEqual({
      method: 'POST',
      url: 'Organization',
      ifNoneExist: `name:exact=${METRIPORT_ACCOUNT_ORGANIZATION_NAME}`,
    })
  })

  test('uses the fixed fullUrl that Provenance.agent references', () => {
    expect(buildAccountOrganizationEntry().fullUrl).toBe(
      ACCOUNT_ORGANIZATION_FULL_URL,
    )
  })

  test('names the Organization', () => {
    expect(buildAccountOrganizationEntry().resource).toEqual({
      resourceType: 'Organization',
      name: METRIPORT_ACCOUNT_ORGANIZATION_NAME,
    })
  })
})
