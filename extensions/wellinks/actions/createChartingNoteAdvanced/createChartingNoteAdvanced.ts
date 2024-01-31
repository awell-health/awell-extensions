import { type Action } from '@awell-health/extensions-core';
import { Category } from '@awell-health/extensions-core';
import { type settings } from '../../config/settings';
import { isNil } from 'lodash';
import { initialiseClient } from '../../api/clients/wellinksGraphqlClient';
import {
  HealthieError,
  mapHealthieToActivityError
} from '../../../healthie/errors';
import { type CustomModule, getSdk } from '../../gql/wellinksSdk';
import { fields, FieldsValidationSchema } from './config/fields';
import type z from 'zod';

interface FormAnswer {
  custom_module_id: string;
  user_id: string;
  answer: string;
}

export const createChartingNoteAdvanced: Action<typeof fields, typeof settings> = {
  key: 'createChartingNoteAdvanced',
  category: Category.EHR_INTEGRATIONS,
  title: 'Fill Form entrance',
  description: 'Fill a multi-part form in Healthie. Note Content must be in an array of FormAnswer objects.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload;
    const {
      healthie_patient_id,
      form_id,
      note_content,
      marked_locked,
      appointment_id
    } = FieldsValidationSchema.parse(fields);

    try {
      const client = initialiseClient(settings);
      if (typeof client === 'undefined') {
        throw new Error();
      }
      const sdk = getSdk(client);
      const { data } = await sdk.getFormTemplate({ id: form_id, });
      const moduleForm = data.customModuleForm;

      if (isNil(moduleForm)) {
        throw new Error(`Form with id ${form_id} doesn't exist`);
      }
      if (!(moduleForm.use_for_charting)) {
        throw new Error(`Form with id ${form_id} cannot be used for charting`);
      }

      const answers = formatAnswers(note_content, moduleForm.custom_modules as CustomModule[]);

      if (answers?.length === 0) {
        throw new Error(`There are no answers in the request`);
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
    } catch (error) {
      if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: errors,
        });
      } else {
        throw error;
      }
    }
  },
}

const formatAnswers = (
  content: z.infer<typeof FieldsValidationSchema>['note_content'],
  customModules: CustomModule[]): FormAnswer[] => {
  const customModuleIds = customModules.map((item) => item.id);
  try {
    const answers = content.map((item) => {
      const x: FormAnswer = {
        custom_module_id: item.custom_module_id,
        user_id: item.user_id,
        answer: item.answer,
      }
      return x;
    });
    return answers.filter((item: FormAnswer) => customModuleIds.includes(item.custom_module_id));
  } catch (err) {
    return [];
  }
};
