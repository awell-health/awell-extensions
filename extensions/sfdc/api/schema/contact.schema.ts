import { z } from 'zod'

const valueSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string().min(1), z.number(), z.boolean()]),
})

const itemSchema = z.object({
  values: z.array(valueSchema),
})

export const attributeSetSchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
})

export const CreateContactInputSchema = z.object({
  contactKey: z.string().min(1).email(),
  attributeSets: z.array(attributeSetSchema),
})

export type CreateContactInputType = z.infer<typeof CreateContactInputSchema>

export const CreateContactResponseSchema = z.object({
  operationStatus: z.string(),
  rowsAffetcted: z.number(),
  contactKey: z.string(),
  contactId: z.number(),
  contactTypeID: z.number(),
  isNewContactKey: z.boolean(),
  requestServiceMessageID: z.string(),
  hasErrors: z.boolean(),
  resultMessages: z.array(z.string()),
  serviceMessageID: z.string(),
})

export type CreateContactResponseType = z.infer<
  typeof CreateContactResponseSchema
>
