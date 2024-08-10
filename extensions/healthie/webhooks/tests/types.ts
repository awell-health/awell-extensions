export interface dataPoint {
  key: string
  type: string
}

export interface getDataFromResponseReturn {
  user_id: string
  data_points: Record<string, string>
}
export interface getAppointmentResponse {
  data: {
    appointment: {
      user: {
        id: string
      }
    }
  }
}

export interface getGoalResponse {
  data: {
    goal: {
      user_id: string
    }
  }
}

export interface getAppliedTagResponse {
  data: {
    appliedTag: {
      user_id: string
    }
  }
}

export interface getFormAnswerGroupResponse {
  data: {
    formAnswerGroup: {
      user: {
        id: string
      }
    }
  }
}

export interface getLabOrderResponse {
  data: {
    labOrder: {
      patient: {
        id: string
      }
    }
  }
}
export interface getMetricEntryResponse {
  data: {
    entry: {
      poster: {
        id: string
      }
    }
  }
}

export interface getRequestedFormCompletionResponse {
  data: {
    requestedFormCompletion: {
      recipient_id: string
    }
  }
}

export interface getTaskResponse {
  data: {
    task: {
      client_id: string
    }
  }
}
