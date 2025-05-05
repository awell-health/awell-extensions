import { z } from 'zod'

export const ActionType = z.enum([
  'identify',
  'delete',
  'event',
  'screen',
  'page',
  'add_relationships',
  'delete_relationships',
  'add_device',
  'delete_device',
  'merge',
  'suppress',
  'unsuppress',
])
