import React from 'react'
import type { ComponentProps } from '@awell-health/extensions-core'
import Cal, { getCalApi } from '@calcom/embed-react'

interface BookingSuccessfulFunctionProps {
  confirmed?: boolean
  date?: string
  eventType?: Record<string, unknown>
  booking?: Record<string, unknown>
}

type BookingSuccessfulFunction = ({
  confirmed,
  date,
  eventType,
  booking,
}: BookingSuccessfulFunctionProps) => void

interface CalDotComSchedulingProps {
  calLink: string
  onBookingSuccessful: BookingSuccessfulFunction
  hideEventTypeDetails?: boolean
  metadata?: Record<string, string>
}

const CalDotComScheduling: React.FC<CalDotComSchedulingProps> = ({
  calLink,
  hideEventTypeDetails = false,
  onBookingSuccessful,
  metadata,
}) => {
  const eventListenerRef = React.useRef(false)
  const calApiRef = React.useRef<any>(null)

  const bookingSuccessfulCallback = (e: { detail: { data: any } }): void => {
    const { data } = e.detail
    const { confirmed, eventType, date, booking } = data
    onBookingSuccessful({ confirmed, eventType, date, booking })
  }

  const initComponent = async (): Promise<void> => {
    const cal = await getCalApi()
    calApiRef.current = cal

    if (cal != null && !eventListenerRef.current) {
      cal('ui', {
        hideEventTypeDetails,
      })

      cal('on', {
        action: 'bookingSuccessful',
        callback: bookingSuccessfulCallback,
      })

      eventListenerRef.current = true
    }
  }

  React.useEffect(() => {
    void initComponent()

    return () => {
      const cleanup = async (): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const cal = calApiRef == null ? (await getCalApi()) : calApiRef.current
        if (cal != null && eventListenerRef.current) {
          cal('off', {
            action: 'bookingSuccessful',
            callback: bookingSuccessfulCallback,
          })
          eventListenerRef.current = false
        }
      }
      void cleanup()
    }
  }, [hideEventTypeDetails])

  let metadataString = ''
  if (metadata != null && Object.keys(metadata).length > 0) {
    metadataString = Object.entries(metadata)
      .map(([key, value]) => `metadata[${key}]=${value}`)
      .join('&')
  }

  const metadataSeparator = calLink.includes('?') ? '&' : '?'
  const composedCalLink = `${calLink}${
    metadataString !== '' ? `${metadataSeparator}${metadataString}` : ''
  }`

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Cal
        calLink={composedCalLink}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      />
    </div>
  )
}

const CalDotComBookAppointmentComponent: React.FC<ComponentProps> = ({
  activityDetails,
  onSubmit,
}) => {
  console.log('activityDetails', activityDetails)
  const calLink = activityDetails.fields.find(field => field.id === 'calLink')?.value ?? ''

  const handleBookingSuccessful: BookingSuccessfulFunction = ({
    confirmed,
    date,
    eventType,
    booking,
  }) => {
    console.log("bookingSuccessful", confirmed, date, eventType, booking)
    void onSubmit(activityDetails.activity_id, [
      { key: 'booking_confirmed', value: String(confirmed ?? false) },
      { key: 'booking_date', value: String(date ?? '') },
      { key: 'event_type', value: JSON.stringify(eventType ?? {}) },
      { key: 'booking_details', value: JSON.stringify(booking ?? {}) },
    ])
  }

  return (
    <div>
      <CalDotComScheduling
        calLink={calLink}
        onBookingSuccessful={handleBookingSuccessful}
        hideEventTypeDetails={false}
      />
    </div>
  )
}

export default CalDotComBookAppointmentComponent
