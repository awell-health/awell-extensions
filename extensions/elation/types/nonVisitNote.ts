import { type z } from 'zod'
import {
  type bulletSchema,
  type nonVisitNoteSchema,
} from '../validation/nonVisitNote.zod'

export type NonVisitNoteInput = z.infer<typeof nonVisitNoteSchema>

export interface NonVisitNoteResponse extends Omit<NonVisitNoteInput, 'tags'> {
  id: number
  tags?: Tag[]
  bullets: Bullet[]
}

interface Bullet extends z.infer<typeof bulletSchema> {
  version: number
  updated_date: string
}

interface Tag {
  id: number
  code: string
  value: string
  code_type: number
  concept_name: string
  created_date: string
  deleted_date?: string
  description: string
}
