import { type ActivityEvent } from '@awell-health/extensions-core'

export class HealthieAppointmentNotCreated extends Error {
  errors: Record<string, unknown>

  constructor(errors: Record<string, unknown>) {
    super('Failed to create the appointment in Healthie.')
    this.name = 'HealthieAppointmentNotCreated'
    this.errors = errors
  }
}

export const parseHealthieAppointmentNotCreatedError = (
  error: Record<string, unknown>
): ActivityEvent => {
  const category = 'BAD_REQUEST'
  const message = JSON.stringify(error, null, 2)

  return {
    date: new Date().toISOString(),
    text: {
      en: message,
    },
    error: {
      category,
      message,
    },
  }
}
