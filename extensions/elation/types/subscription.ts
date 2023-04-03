/**
 * You can only subscribe to the same resource and the same target once. A status 409 will be returned if you attempt to send duplicate subscription.
 */
export interface SubscriptionRequest {
  resource: string
  target: string
  properties: string | null // unsure what this does. it says 'see below for usage' and nothing is there.
}

export interface Subscription {
  id: number
  resource: string // The resource for this object.
  target: string // Target URL where we would send the POST request on new events
  properties: string | null
  created_date: string
  deleted_date: string | null
  signing_pub_key: string
}

/**
 * THis is what the webhook event should look like.
 * TODO: Define `resource` parameter
 */
export interface SubscriptionEvent {
  data: any // The object (definition will change per resources)
  action: 'saved' | 'deleted' // Actions available: saved, deleted
  event_id: number // The event id to reference this request
  application_id: number // The client id of the oauth2 application
  resource: string // The resource for this object.
}
