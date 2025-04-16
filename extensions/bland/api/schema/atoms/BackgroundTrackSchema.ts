import { z } from 'zod'

export const BackgroundTrackEnum = z.enum([
  'null',
  'office',
  'cafe',
  'restaurant',
  'none',
])

export const BackgroundTrackSchema = BackgroundTrackEnum.transform((value) =>
  value === 'null' ? null : value,
)

export type BackgroundTrack = z.infer<typeof BackgroundTrackSchema>

export const backgroundTrackOptions: Array<{
  value: z.infer<typeof BackgroundTrackEnum>
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
