import { z } from 'zod'

export const BackgroundTrackSchema = z
  .enum(['null', 'office', 'cafe', 'restaurant', 'none'])
  .transform((value) => (value === 'null' ? null : value))

export type BackgroundTrack = z.infer<typeof BackgroundTrackSchema>

export const backgroundTrackOptions: Array<{
  value: string
  label: string
}> = [
  { value: 'null', label: 'Default' },
  {
    value: 'office',
    label: 'Office',
  },
  {
    value: 'cafe',
    label: 'Cafe',
  },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'none', label: 'None' },
]
