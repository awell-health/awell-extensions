import { z } from 'zod'
import {
  PrioritySchema,
  ServiceRequestIntentSchema,
  ServiceRequestStatusSchema,
} from '../atoms'

export const CreateServiceRequestSchema = z.object({
  patientId: z.string().nonempty('Missing Medplum patient ID'),
  status: ServiceRequestStatusSchema,
  intent: ServiceRequestIntentSchema,
  priority: PrioritySchema.optional(),
})
