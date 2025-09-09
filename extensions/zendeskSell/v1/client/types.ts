export enum ResourceType {
  LEAD = 'lead',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
}

export interface SalesApiBody<D, R extends ResourceType> {
  data: D
  meta: {
    type: R
  }
}

export interface SalesApiErrorResponse {
  errors: Array<{
    error: {
      resource: ResourceType
      field: string
      code: string
      message: string
      details: string
    }
    meta: {
      type: string
      links: {
        more_info: string
      }
    }
  }>
  meta: {
    type: string
    http_status: string
    logref: string
    links: {
      more_info: string
    }
  }
}
