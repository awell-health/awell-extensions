import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'
import { enumDataPointValueType } from '@awell-health/awell-sdk'

export const getDataPointValue: Action<typeof fields, typeof settings> = {
  key: 'getDataPointValue',
  category: Category.WORKFLOW,
  title: 'Get data point value',
  description: 'Get the value of a data point',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { careFlowId, dataPointDefinitionId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    const resp = await sdk.orchestration.query({
      pathwayDataPoints: {
        __args: {
          pathway_id: careFlowId,
          data_point_definition_id: dataPointDefinitionId,
        },
        success: true,
        dataPoints: {
          id: true,
          key: true,
          serialized_value: true,
          data_point_definition_id: true,
          valueType: true,
          date: true,
        },
      },
    })

    const dataPoints = resp.pathwayDataPoints.dataPoints

    if (dataPoints.length === 0) {
      await onError({
        events: [
          addActivityEventLog({
            message:
              'No data point values were found for the given data point definition id.',
          }),
        ],
      })
      return
    }

    /**
     * If a single data point definition has multiple values, there will be
     * multiple entries in the dataPoints array. We need to get the most recent
     */
    const mostRecentDataPoint = dataPoints.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })[0]

    await onComplete({
      data_points: {
        valueString:
          mostRecentDataPoint.valueType === enumDataPointValueType.STRING
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueNumber:
          mostRecentDataPoint.valueType === enumDataPointValueType.NUMBER
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueDate:
          mostRecentDataPoint.valueType === enumDataPointValueType.DATE
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueJson:
          mostRecentDataPoint.valueType === enumDataPointValueType.JSON
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueBoolean:
          mostRecentDataPoint.valueType === enumDataPointValueType.BOOLEAN
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueTelephone:
          mostRecentDataPoint.valueType === enumDataPointValueType.TELEPHONE
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueStringsArray:
          mostRecentDataPoint.valueType === enumDataPointValueType.STRINGS_ARRAY
            ? mostRecentDataPoint.serialized_value
            : undefined,
        valueNumbersArray:
          mostRecentDataPoint.valueType === enumDataPointValueType.NUMBERS_ARRAY
            ? mostRecentDataPoint.serialized_value
            : undefined,
      },
    })
  },
}
