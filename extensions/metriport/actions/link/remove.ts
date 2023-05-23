import { type Action, type DataPointDefinition } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { removeFields } from './fields'
import { linkRemoveSchema } from './validation'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const removeLink: Action<
  typeof removeFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'removeLink',
  category: Category.EHR_INTEGRATIONS,
  title: 'Remove Link',
  description: "Remove an link using Metriport's API.",
  fields: removeFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, linkSource, facilityId } = linkRemoveSchema.parse(
        payload.fields
      )

      const api = createMetriportApi(payload.settings)

      await api.removeLink(patientId, facilityId, linkSource)

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
