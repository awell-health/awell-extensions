/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { labOrderSchema } from '../validation/labOrder.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient for whom the lab order is being created.',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice',
    description:
      'The ID of the practice for which the lab order is being created.',
    type: FieldType.NUMERIC,
    required: true,
  },
  documentDate: {
    id: 'documentDate',
    label: 'Document Date',
    description: 'The date and time of the lab order document.',
    type: FieldType.DATE,
    required: true,
  },
  orderingPhysicianId: {
    id: 'orderingPhysicianId',
    label: 'Ordering Physician ID',
    description: 'The ID of the physician who is creating the order.',
    type: FieldType.NUMERIC,
    required: true,
  },
  vendorId: {
    id: 'vendorId',
    label: 'Vendor ID',
    description: 'The ID of the vendor (or Lab) associated with the lab order.',
    type: FieldType.NUMERIC,
    required: false,
  },
  content: {
    id: 'content',
    label: 'Content',
    description:
      'Represents the content of the lab order report. Should be in JSON format. See https://docs.elationhealth.com/reference/the-lab-order-content-object',
    type: FieldType.JSON,
    required: false,
  },
  siteId: {
    id: 'siteId',
    label: 'Site ID',
    description:
      'The location where the patient will have the lab performed. Sites are specific to their lab vendor',
    type: FieldType.NUMERIC,
    required: false,
  },
  confidential: {
    id: 'confidential',
    label: 'Confidential',
    description:
      'Defaults to false. Whether the provider has marked the order as confidential. Should not be shared with a patient.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  labOrderId: {
    key: 'labOrderId',
    valueType: 'number',
  },
  printableLabOrderView: {
    key: 'printableLabOrderView',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createLabOrder: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createLabOrder',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create lab order',
  description:
    'A lab order represents an order for a patient to perform some lab tests for a vendor.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        patientId,
        practiceId,
        orderingPhysicianId,
        documentDate,
        vendorId,
        content,
        siteId,
        confidential,
      } = payload.fields

      const labOrder = labOrderSchema.parse({
        practice: practiceId,
        patient: patientId,
        document_date: documentDate,
        ordering_physician: orderingPhysicianId,
        vendor: vendorId,
        content,
        confidential,
        site: siteId,
      })

      const api = makeAPIClient(payload.settings)
      const { id, printable_view } = await api.createLabOrder(labOrder)
      await onComplete({
        data_points: {
          labOrderId: String(id),
          printableLabOrderView: printable_view,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
