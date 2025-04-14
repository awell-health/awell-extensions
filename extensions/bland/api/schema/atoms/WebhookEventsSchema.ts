import { z } from 'zod'

export const WebhookEventsSchema = z.array(
  z.enum(['queue', 'call', 'latency', 'webhook', 'tool', 'dynamic_data']),
)
