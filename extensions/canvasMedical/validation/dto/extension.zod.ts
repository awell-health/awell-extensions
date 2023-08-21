import { z } from 'zod'

export const birthsexExtension = z.object({
  url: z.string(),
  valueCode: z.enum(['M', 'F', 'O', 'UNK']),
})

export const ethnicityExtension = z.object({
  url: z.string(),
  extension: z.array(
    z.object({
      url: z.string().optional(),
      valueCoding: z.object({
        code: z.string(),
        system: z.string(),
      }),
      valueString: z.string().optional(),
    })
  ),
})

export const raceExtension = z.object({
  url: z.string(),
  extension: z.array(
    z.object({
      url: z.string().optional(),
      valueCoding: z.object({
        system: z.string(),
        code: z.string(),
      }),
      valueString: z.string().optional(),
    })
  ),
})

export const timezoneExtension = z.object({
  url: z.string(),
  valueCode: z.string(),
})

export const clinicalNoteExtension = z.object({
  url: z.string(),
  valueString: z.string(),
})

export const administrativeNoteExtension = z.object({
  url: z.string(),
  valueString: z.string(),
})

export const referredPharmacyExtension = z.object({
  url: z.string(),
  extension: z.array(
    z.object({
      url: z.string(),
      valueIdentifier: z.object({
        value: z.string(),
        system: z.string(),
      }),
      valueString: z.string().optional(),
    })
  ),
})

export const basicExtension = z.object({
  url: z.string(),
  extension: z.array(
    z.object({
      url: z.string(),
      valueString: z.string(),
    })
  ),
})

export const extensionSchema = z.union([
  birthsexExtension,
  ethnicityExtension,
  raceExtension,
  timezoneExtension,
  clinicalNoteExtension,
  administrativeNoteExtension,
  referredPharmacyExtension,
  basicExtension,
])
