import * as z from 'zod'
import {
  DateTimeSchema,
  NumericIdSchema,
  validateCommaSeparatedList,
} from '@awell-health/extensions-core'

const nonVisitNoteTypeEnum = z.enum(['email', 'nonvisit', 'phone'])

// All values taken from Elation's API
export const bulletCategoryEnum = z.enum([
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
  id: NumericIdSchema.optional(),
  text: z.string().min(1),
  author: NumericIdSchema,
  /**
   * Hotfix, see https://awellhealth.slack.com/archives/C074XR57N0G/p1736802124866829
   * TODO: Remove this once we have a proper solution for the category field
   */
  // category: bulletCategoryEnum.default(bulletCategoryEnum.enum.Problem),
  category: z.string().optional(),
})

export const nonVisitNoteSchema = z.object({
  type: nonVisitNoteTypeEnum.default(nonVisitNoteTypeEnum.enum.nonvisit),
  bullets: z.array(bulletSchema),
  patient: NumericIdSchema,
  practice: NumericIdSchema.optional(),
  document_date: DateTimeSchema,
  chart_date: DateTimeSchema,
  tags: validateCommaSeparatedList(
    (value) => NumericIdSchema.safeParse(value).success,
    true,
  ).optional(),
  signed_by: NumericIdSchema.optional(),
  sign_date: DateTimeSchema.optional(),
})
