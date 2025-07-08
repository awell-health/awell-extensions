import { patientCreated } from './patientCreated'
import { observationCreated } from './ObservationCreated/ObservationCreated'

export const webhooks = [patientCreated, observationCreated]
