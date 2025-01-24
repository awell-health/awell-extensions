import { z } from 'zod'
import {
  PrioritySchema,
  ServiceRequestIntentSchema,
  ServiceRequestStatusSchema,
} from '../../../../../src/lib/fhir/schemas/ServiceRequest'

export const CreateServiceRequestSchema = z.object({
  patientId: z.string().min(1, 'Missing Medplum patient ID'),
  status: ServiceRequestStatusSchema,
  intent: ServiceRequestIntentSchema,
  priority: PrioritySchema.optional(),
})
