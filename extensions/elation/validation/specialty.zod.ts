import { z } from 'zod';


export const specialtySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  abbreviation: z.string().optional()
});
