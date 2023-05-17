import { type Field, FieldType, type Action, type DataPointDefinition } from "../../../lib/types";
import { Category } from "../../../lib/types/marketplace";
import { getSdk } from "../gql/sdk";
import { initialiseClient } from "../graphqlClient";
import { type settings } from "../settings";

// Purpose: 
const fields = {
    patientId: {
        id: 'patientId',
        label: 'Patient ID',
        description: 'The ID of the patiet to check an override for.',
        type: FieldType.STRING,
        required: true,
    },
    date: {
        id: 'date',
        label: 'Date',
        description: 'The date from which you want to search for a form. If null, the search will be from the beginning of the patient history',
        type: FieldType.DATE,
        required: false,
    }
} satisfies Record<string, Field>


const SELECT_EVENT_TYPE_QUESTION_ID = "2602707"
const START_SENDING_SCHEDULED_REMINDERS_QUESTION_ID = "3860906"

const dataPoints = {
    activeOverride: {
        key: 'activeOverride',
        valueType: 'boolean'
    },
    overrideDate: {
        key: 'overrideDate',
        valueType: 'date'
    }
} satisfies Record<string, DataPointDefinition>

export const checkForOverride: Action< typeof fields, typeof settings, keyof typeof dataPoints> = {
    key: 'checkForOverride',
    category: Category.SCHEDULING,
    title: 'Check if a patient has an active Override',
    description: 'Check if a patient has an active Override form in Healthie.',
    fields,
    previewable: true, 
    onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
        const { fields, settings} = payload
        const { patientId } = fields
        try {
            const client = initialiseClient(settings)
            if (client != null) {
                const sdk = getSdk(client)
                const { data } = await sdk.getChartingItems({ user_id: patientId, custom_module_form_id: "281216"})

                if (data.chartingItems != null) {
                    
                    const overrideForms = data.chartingItems.filter(
                        (value) => value?.form_answer_group?.form_answers.find((value) => value.custom_module_id === SELECT_EVENT_TYPE_QUESTION_ID)?.answer === "Override Scheduling Reminder Automations"
                    )
                    const overrideDates = overrideForms.map((form) => form?.form_answer_group?.form_answers.find((value) => value.custom_module_id === START_SENDING_SCHEDULED_REMINDERS_QUESTION_ID)?.answer)
                    const dates = overrideDates.map((strDate) =>  { 
                        if (strDate !== null && strDate !== undefined) {
                            return new Date(strDate)
                        } else {
                            return null
                        }
                    })
                    
                    const now = new Date()
                    const latestOverride = dates.sort((a, b) => (a?.getTime() ?? 0) - (b?.getTime() ?? 0))[0]
                    
                        if (latestOverride !== null && latestOverride > now) {
                        await onComplete({
                                data_points: {
                                    activeOverride: "true",
                                    overrideDate: dates[0]?.toISOString()
                                }
                            })
                        }
                    
                } else {
                    await onError({
                        events: [
                            {
                                date: new Date().toISOString(),
                                text: { en: 'There was in error processing the Charting Items' },
                                error: {
                                    category: 'WRONG_DATA',
                                    message: 'Charting Items returned Null'
                                }
                            }
                        ]
                    })
                }
            }  else {
                await onError({
                  events: [
                    {
                      date: new Date().toISOString(),
                      text: { en: 'API client requires an API url and API key' },
                      error: {
                        category: 'MISSING_SETTINGS',
                        message: 'Missing api url or api key',
                      },
                    },
                  ],
                })
              }
        } catch (err) {
            const error = err as Error
            await onError({
                events: [
                    {
                        date: new Date().toISOString(),
                        text: { en: 'There was in error processing the Charting Items' },
                        error: {
                            category: 'SERVER_ERROR',
                            message: error.message
                        }
                    }
                ]
            })

        }
    },
}
