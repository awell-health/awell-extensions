// https://www.hl7.org/fhir/datatypes.html#base64Binary

import { z } from 'zod'

export const base64Binary = z
  .string()
  .regex(/(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/)
