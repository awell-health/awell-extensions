import * as z from 'zod'
import {
  DateTimeSchema,
  NumericIdSchema,
  validateCommaSeparatedList,
} from '../../../lib/shared/validation'

const nonVisitNoteTypeEnum = z.enum(['email', 'nonvisit', 'phone'])

const bulletCategoryEnum = z.enum([
  'Problem',
  'Past',
  'Family',
  'Social',
  'Instr',
  'PE',
  'ROS',
  'Med',
  'Data',
  'Assessment',
  'Test',
  'Tx',
  'Narrative',
  'Followup',
  'Reason',
  'Plan',
  'Objective',
  'Hpi',
  'Allergies',
  'Habits',
  'Assessplan',
  'Consultant',
  'Attending',
  'Dateprocedure',
  'Surgical',
  'Orders',
  'Referenced',
  'Procedure',
])

export const bulletSchema = z.object({
  text: z.string().nonempty(),
  author: NumericIdSchema,
  category: bulletCategoryEnum.default(bulletCategoryEnum.enum.Problem),
})

export const nonVisitNoteSchema = z
  .object({
    type: nonVisitNoteTypeEnum.default(nonVisitNoteTypeEnum.enum.nonvisit),
    patient: NumericIdSchema,
    practice: NumericIdSchema.optional(),
    document_date: DateTimeSchema,
    chart_date: DateTimeSchema,
    tags: validateCommaSeparatedList(
      (value) => NumericIdSchema.safeParse(value).success,
      true
    ).optional(),
  })
  .and(bulletSchema.transform((bullet) => ({ bullets: [bullet] })))
