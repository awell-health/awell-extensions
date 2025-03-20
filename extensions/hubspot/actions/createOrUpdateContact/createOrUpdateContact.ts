import {
  type ActivityEvent,
  Category,
  type Action,
} from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type ApiException } from '@hubspot/api-client/lib/codegen/crm/contacts'
import { getExistingContact, updateContact, createContact } from './helpers'

export const createOrUpdateContact: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createOrUpdateContact',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Create or update contact',
  description: 'Create or update a contact in HubSpot',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const eventLogs: ActivityEvent[] = []

    const { hubSpotSdk, fields } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const createOrUpdateProperties = {
      /**
       * Default Hubspot properties
       * Available in every Hubspot account
       */
      email: fields.email,
      ...(!isNil(fields.firstName) && { firstname: fields.firstName }),
      ...(!isNil(fields.lastName) && { lastname: fields.lastName }),
      ...(!isNil(fields.phone) && { phone: fields.phone }),
      /**
       * Custom properties
       */
      ...(!isNil(fields.customProperties) && fields.customProperties),
    }

    try {
      // Try retrieving an existing contact
      const existingContact = await getExistingContact(hubSpotSdk, fields.email)

      if (!isNil(existingContact)) {
        eventLogs.push(
          addActivityEventLog({
            message: `Existing contact found in Hubspot with email ${fields.email}. Contact ID: ${existingContact.id}`,
          }),
          addActivityEventLog({
            message: `Existing contact details: ${JSON.stringify(existingContact, null, 2)}`,
          }),
        )

        // Update the existing contact
        const updatedContact = await updateContact(
          hubSpotSdk,
          existingContact.id,
          createOrUpdateProperties,
        )

        await onComplete({
          data_points: {
            hubspotContactId: updatedContact.id,
            contactResource: JSON.stringify(updatedContact),
          },
          events: [
            ...eventLogs,
            addActivityEventLog({
              message: `Updated contact:\n${JSON.stringify(updatedContact, null, 2)}`,
            }),
          ],
        })
        return
      }

      // Contact not found, create a new one
      eventLogs.push(
        addActivityEventLog({
          message: `No existing contact found in Hubspot with email ${fields.email}.`,
        }),
      )

      const newContact = await createContact(
        hubSpotSdk,
        createOrUpdateProperties,
      )

      await onComplete({
        data_points: {
          hubspotContactId: newContact.id,
          contactResource: JSON.stringify(newContact),
        },
        events: [
          ...eventLogs,
          addActivityEventLog({
            message: `Contact created in Hubspot with email ${fields.email}. Contact ID: ${newContact.id}`,
          }),
          addActivityEventLog({
            message: `New contact:\n${JSON.stringify(newContact, null, 2)}`,
          }),
        ],
      })
    } catch (err) {
      const typedError = err as ApiException<unknown>
      await onError({
        events: [
          ...eventLogs,
          addActivityEventLog({
            message: `Error in Hubspot operation: ${typedError.code}: ${typedError.message}\n${JSON.stringify(
              typedError.body,
              null,
              2,
            )}`,
          }),
        ],
      })
    }
  },
}
