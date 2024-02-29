import { type Setting, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import z from 'zod'
import { FieldSchema, fields } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { makeAPIClient } from '../../client'
import { checkICDCode } from './config/helperFunctions'

const settings = {} satisfies Record<string, Setting>
const SettingSchema = z.unknown()

const PayloadSchema = z.object({
  fields: FieldSchema,
  settings: SettingSchema,
})

export const icd: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'icd',
  category: Category.DATA,
  title: 'ICD-10 Code Lookup',
  description: 'Lookup ICD-10 codes and return the parent disease',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const {
      fields: { icd_codes },
    } = PayloadSchema.parse(payload)
    // if no codes, just return blank
    if (icd_codes.length === 0) {
      await onComplete({
        data_points: {
          codes: JSON.stringify([]),
          stringResponse: 'Blank',
        },
      })
      return
    }

    const IDPClient = makeAPIClient()
    const icdCodes = await Promise.all(
      icd_codes.map(async (code: string) => {
        const response = await IDPClient.getCode(code)
        if (response.parent !== undefined) {
          if (response.parent === 'Not Found') {
            return response.title
          }
          const parent = await IDPClient.getCode(response.parent)
          return parent.title
        }
      })
    )

    const resp = icdCodes.some(checkICDCode)

    await onComplete({
      data_points: {
        codes: JSON.stringify(icdCodes.join(', ')),
        stringResponse: resp ? 'TFU' : 'TCM',
      },
    })
  },
}
