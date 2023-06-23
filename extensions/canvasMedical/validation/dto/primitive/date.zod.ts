// https://www.hl7.org/fhir/datatypes.html#date

import { z } from 'zod'

export const date = z
  .string()
  .regex(
    /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?/
  )
