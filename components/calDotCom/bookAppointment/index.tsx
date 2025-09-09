import React from 'react'
import type { ComponentProps } from '@awell-health/extensions-core'

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
  metadata?: { [key: string]: string }
}

const CalDotComScheduling: React.FC<CalDotComSchedulingProps> = ({
  calLink,
  hideEventTypeDetails = false,
  onBookingSuccessful,
  metadata,
}) => {
  React.useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://app.cal.com' && event.origin !== 'https://cal.com') return
      
      if (event.data?.type === 'CAL:booking_successful') {
        const { confirmed, eventType, date, booking } = event.data.data
        onBookingSuccessful({ confirmed, eventType, date, booking })
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [onBookingSuccessful])

  let metadataString = ''
  if (metadata) {
    metadataString = Object.entries(metadata)
      .map(([key, value]) => `metadata[${key}]=${value}`)
      .join('&')
  }

  const metadataSeparator = calLink.includes('?') ? '&' : '?'
  const composedCalLink = `${calLink}${
    metadataString ? `${metadataSeparator}${metadataString}` : ''
  }`

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <div
        data-cal-link={composedCalLink}
        data-cal-config={JSON.stringify({
          layout: 'month_view',
          hideEventTypeDetails: hideEventTypeDetails
        })}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      />
    </div>
  )
}

const CalDotComBookAppointmentComponent: React.FC<ComponentProps> = ({
  activityDetails,
  onSubmit,
}) => {
  const calLink = activityDetails.fields.find(field => field.id === 'calLink')?.value || ''

  const handleBookingSuccessful: BookingSuccessfulFunction = ({
    confirmed,
    date,
    eventType,
    booking,
  }) => {
    void onSubmit(activityDetails.activity_id, [
      { key: 'booking_confirmed', value: String(confirmed || false) },
      { key: 'booking_date', value: String(date || '') },
      { key: 'event_type', value: JSON.stringify(eventType || {}) },
      { key: 'booking_details', value: JSON.stringify(booking || {}) },
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
