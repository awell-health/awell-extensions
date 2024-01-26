import { type Action } from '@awell-health/extensions-core';
import { Category } from '@awell-health/extensions-core';
import { fields } from './config';
import { type settings } from '../../settings';
import { isNaN, isNil } from 'lodash';
import { initialiseClient } from '../../graphqlClient';
import { HealthieError, mapHealthieToActivityError } from '../../errors';
import { getSdk } from '../../gql/sdk';

interface FormAnswer {
  custom_module_id: string;
  user_id: string;
  answer: string;
}

export const createChartingNoteAdvanced: Action<typeof fields, typeof settings> = {
  key: 'createChartingNoteAdvanced',
  category: Category.EHR_INTEGRATIONS,
  title: 'Fill Form entrance',
  description: 'Fill a form in Healthie',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload;
    const { healthie_patient_id, form_id, note_content, marked_locked, appointment_id } = fields;
    try {
      if (isNil(healthie_patient_id) || isNaN(healthie_patient_id)
        || isNil(form_id) || isNaN(form_id)
        || isNil(note_content)
      ) {
        await onError(getError('`healthie_patient_id`, `form_id` is missing or coud have a wrong value or `note_content` is missing or is not a json object', 'Fields are missing', 'MISSING_FIELDS'));
        return;
      }

      const client = initialiseClient(settings);
      if (client !== undefined) {
        const sdk = getSdk(client);
        const { data } = await sdk.getFormTemplate({ id: form_id, });
        const moduleForm = data.customModuleForm;

        if (isNil(moduleForm)) {
          await onError(getError(`Form with id ${form_id} doesn't exist`, `Form doesn't exist`, 'WRONG_INPUT'));
          return;
        }
        if (!moduleForm.use_for_charting) {
          await onError(getError(`Form with id ${form_id} cannot be used for charting`, `Form isn't a charting form`, 'SERVER_ERROR'));
        }

        const answers = formatAnswers(note_content);

        if (answers?.length === 0) {
          await onError(getError(`There are no answers in the request`, `No answers provided or invalid data`, 'WRONG_INPUT'));
          return;
        }

        await sdk.createFormAnswerGroup({
          input: {
            finished: true,
            custom_module_form_id: form_id,
            user_id: healthie_patient_id,
            appointment_id,
            form_answers: answers,
            marked_locked: marked_locked ?? false,
          },
        });
        await onComplete();
      } else {
        await onError(getError('Missing api url or api key', 'API client requires an API url and API key', 'MISSING_SETTINGS'));
      }
    } catch (error) {
      if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: errors,
        });
      } else {
        const err = error as Error
        await onError(getError(err.message, 'Healthie API reported and error', 'SERVER_ERROR'))
      }
    }
  },
}


const getError = (message: string, text: string, category: string): object => {
  return {
    events: [
      {
        data: new Date().toISOString(),
        text: { en: text },
        error: {
          category,
          message,
        },
      },
    ],
  };
}

const formatAnswers = (content: any): FormAnswer[] => {
  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content
    return data.map((item: any) => {
      const x: FormAnswer = {
        custom_module_id: item.custom_module_id,
        user_id: item.user_id,
        answer: item.answer,
      }
      return x;
    });
  } catch (err) {
    return [];
  }
}