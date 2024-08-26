import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { CalDotComScheduling, useTheme } from '@awell-health/ui-library'
import { mapActionFieldsToObject } from '../../../../../src/utils/mapToObject'
import { ExtensionActivityRecord, CompleteExtensionActivityInput } from '@awell-health/ui-library'
import type { BookAppointmentFields, BookingSuccessfulFunction } from './types'

type DataPoints = CompleteExtensionActivityInput['data_points']

interface BookAppointmentActionProps {
  activityDetails: ExtensionActivityRecord
  onSubmit: (activity_id: string, data_points: DataPoints) => Promise<void>
}

export const BookAppointmentAction: FC<BookAppointmentActionProps> = ({
  activityDetails,
  onSubmit,
}) => {
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { activity_id, fields, pathway_id } = activityDetails

  const { calLink } = useMemo(
    () => mapActionFieldsToObject<BookAppointmentFields>(fields),
    [fields],
  )

  const onBookingSuccessful: BookingSuccessfulFunction = useCallback(
    (data) => {
      const dataPoints: DataPoints = [
        { key: 'bookingId', value: `${data?.booking?.id}` },
      ]
      onSubmit(activity_id, dataPoints)
    },
    [activity_id, onSubmit],
  )

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [])

  return (
    <CalDotComScheduling
      calLink={calLink}
      metadata={{
        awellPathwayId: pathway_id,
        awellActivityId: activity_id,
      }}
      onBookingSuccessful={onBookingSuccessful}
    />
  )
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
