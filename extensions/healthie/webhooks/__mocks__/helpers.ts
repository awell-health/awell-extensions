import type { dataPoint, getDataFromResponseReturn } from './types'
import { isNil } from 'lodash'

export function processDataPoints(
  dataPoints: dataPoint[],
  resource_id: string,
  data: any
): Record<string, string> {
  const result: Record<string, string> = {}

  dataPoints.forEach(({ type, key }) => {
    switch (type) {
      case 'id':
        result[key] = resource_id
        break
      case 'json':
        if (!isNil(data.appointment)) {
          result[key] = JSON.stringify(data.appointment)
        } else if (!isNil(data.formAnswerGroup)) {
          result[key] = JSON.stringify(data.formAnswerGroup)
        }
        break
      default:
        break
    }
  })

  return result
}

export const processWebhook = (
  sdkMock: any,
  dataPoints: dataPoint[],
  resource_id: string
): getDataFromResponseReturn => {
  const { method, response } = sdkMock[0]

  // get data points from the response
  const data_points = processDataPoints(dataPoints, resource_id, response.data)

  switch (method) {
    case 'getAppliedTag': {
      return {
        user_id: response.data.appliedTag.user_id,
        data_points,
      }
    }
    case 'getAppointment': {
      return {
        user_id: response.data.appointment?.user.id,
        data_points,
      }
    }
    case 'getFormAnswerGroup': {
      return {
        user_id: response.data.formAnswerGroup.user.id,
        data_points,
      }
    }
    case 'getGoal': {
      return {
        user_id: response.data.goal.user_id,
        data_points,
      }
    }
    case 'getLabOrder': {
      return {
        user_id: response.data.labOrder.patient.id,
        data_points,
      }
    }
    case 'getMetricEntry': {
      return {
        user_id: response.data.entry.poster.id,
        data_points,
      }
    }
    case 'getRequestedFormCompletion': {
      return {
        user_id: response.data.requestedFormCompletion.recipient_id,
        data_points,
      }
    }
    case 'getTask': {
      return {
        user_id: response.data.task.client_id,
        data_points,
      }
    }
    default: {
      return { user_id: '', data_points: {} }
    }
  }
}
