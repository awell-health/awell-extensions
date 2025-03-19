import { Client } from '@hubspot/api-client'
import {
  type ApiException,
  type SimplePublicObjectWithAssociations,
  type SimplePublicObject,
} from '@hubspot/api-client/lib/codegen/crm/contacts'

export const getExistingContact = async (
  hubSpotSdk: Client,
  email: string,
): Promise<SimplePublicObjectWithAssociations | null> => {
  try {
    const includeArchived = false

    return await hubSpotSdk.crm.contacts.basicApi.getById(
      email,
      undefined,
      undefined,
      undefined,
      includeArchived,
      'email',
    )
  } catch (err) {
    const typedError = err as ApiException<unknown>
    if (typedError.code === 404) {
      return null // Contact does not exist
    }
    throw typedError // Other errors should propagate
  }
}

/**
 * Updates an existing contact in HubSpot.
 */
export const updateContact = async (
  hubSpotSdk: Client,
  contactId: string,
  properties: Record<string, string>,
): Promise<SimplePublicObject> => {
  return await hubSpotSdk.crm.contacts.basicApi.update(contactId, {
    properties,
  })
}

/**
 * Creates a new contact in HubSpot.
 */
export const createContact = async (
  hubSpotSdk: Client,
  properties: Record<string, string>,
): Promise<SimplePublicObject> => {
  return await hubSpotSdk.crm.contacts.basicApi.create({
    associations: [],
    properties,
  })
}
