import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import {
  backgroundTrackOptions,
  BackgroundTrackEnum,
  ModelSchema,
  VoicemailActionSchema,
} from '../../../api/schema/atoms'
import z, { type ZodTypeAny } from 'zod'
import { getTimezoneOptions } from '../../../../awell/v1/actions/updatePatient/config/getTimezones'
import {
  dropdownOptionsBoolean,
  dropdownOptionsBooleanSchema,
  JsonArraySchema,
  JsonObjectSchema,
} from '../../../lib/sharedActionFields'

export const fields = {
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone number',
    description: 'The phone number to call.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  task: {
    id: 'task',
    label: 'Task',
    description:
      'Provide instructions, relevant information, and examples of the ideal conversation flow.',
    type: FieldType.TEXT,
    required: true,
  },
  voice: {
    id: 'voice',
    label: 'Voice',
    description:
      'The voice of the AI agent to use. Accepts any form of voice ID, including custom voice clones and voice presets.',
    type: FieldType.STRING,
    required: false,
  },
  background_track: {
    id: 'background_track',
    label: 'Background track',
    description:
      'Select an audio track that you’d like to play in the background during the call. The audio will play continuously when the agent isn’t speaking, and is incorporated into it’s speech as well.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: backgroundTrackOptions,
    },
  },
  first_sentence: {
    id: 'first_sentence',
    label: 'First sentence',
    description:
      'Makes your agent say a specific phrase or sentence for it’s first response.',
    type: FieldType.STRING,
    required: false,
  },
  wait_for_greeting: {
    id: 'wait_for_greeting',
    label: 'Wait for greeting',
    description:
      'When enabled, the agent will wait for the call recipient to speak first before responding.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  block_interruptions: {
    id: 'block_interruptions',
    label: 'Block interruptions',
    description:
      'When enabled, the AI will not respond or process interruptions from the user.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  interruption_threshold: {
    id: 'interruption_threshold',
    label: 'Interruption threshold',
    description:
      'Adjusts how patient the AI is when waiting for the user to finish speaking. Lower values mean the AI will respond more quickly, while higher values mean the AI will wait longer before responding.',
    type: FieldType.NUMERIC,
    required: false,
  },
  model: {
    id: 'model',
    label: 'Model',
    description: 'Select a model to use for your call.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(ModelSchema.enum).map((model) => ({
        label: model,
        value: model,
      })),
    },
  },
  temperature: {
    id: 'temperature',
    label: 'Temperature',
    description:
      'A value between 0 and 1 that controls the randomness of the LLM. 0 will cause more deterministic outputs while 1 will cause more random.',
    type: FieldType.NUMERIC,
    required: false,
  },
  dynamic_data: {
    id: 'dynamic_data',
    label: 'Dynamic data',
    description:
      'Integrate data from external APIs into your agent’s knowledge.',
    type: FieldType.JSON,
    required: false,
  },
  keywords: {
    id: 'keywords',
    label: 'Keywords',
    description:
      'Comma-separated list of keywords. These words will be boosted in the transcription engine - recommended for proper nouns or words that are frequently mis-transcribed.',
    type: FieldType.STRING,
    required: false,
  },
  pronunciation_guide: {
    id: 'pronunciation_guide',
    label: 'Pronunciation guide',
    description:
      'The pronunciation guide is an array of objects that guides the agent on how to say specific words. This is great for situations with complicated terms or names.',
    type: FieldType.JSON,
    required: false,
  },
  language: {
    id: 'language',
    label: 'Language',
    description:
      'Optimizes every part of our API for that language - transcription, speech, and other inner workings.',
    type: FieldType.STRING,
    required: false,
  },
  local_dialing: {
    id: 'local_dialing',
    label: 'Local dialing',
    description:
      'When true, automatically selects a “from” number that matches the callee’s area code for US-based calls. Must have purchased a local dialing add-on.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  voicemail_sms: {
    id: 'voicemail_sms',
    label: 'Voicemail SMS',
    description: 'Configure SMS settings for voicemail notifications.',
    type: FieldType.JSON,
    required: false,
  },
  dispatch_hours: {
    id: 'dispatch_hours',
    label: 'Dispatch hours',
    description: 'Restricts calls to certain hours in your timezone.',
    type: FieldType.JSON,
    required: false,
  },
  sensitive_voicemail_detection: {
    id: 'sensitive_voicemail_detection',
    label: 'Sensitive voicemail detection',
    description:
      'When true, uses LLM-based analysis to detect frequent voicemails.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  noise_cancellation: {
    id: 'noise_cancellation',
    label: 'Noise cancellation',
    description:
      'Toggles noise filtering or suppression in the audio stream to filter out background noise.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  ignore_button_press: {
    id: 'ignore_button_press',
    label: 'Ignore button press',
    description:
      'When true, DTMF (digit) presses are ignored, disabling menu navigation or call transfers triggered by keypad input.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  timezone: {
    id: 'timezone',
    label: 'Timezone',
    description:
      'Set the timezone for the call. Handled automatically for calls in the US.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: getTimezoneOptions(),
    },
  },
  tools: {
    id: 'tools',
    label: 'Tools',
    description: 'Interact with the real world through API calls.',
    type: FieldType.JSON,
    required: false,
  },
  voicemail_message: {
    id: 'voicemail_message',
    label: 'Voicemail message',
    description:
      'When the AI encounters a voicemail, it will leave this message after the beep and then immediately end the call.',
    type: FieldType.STRING,
    required: false,
  },
  voicemail_action: {
    id: 'voicemail_action',
    label: 'Voicemail action',
    description:
      'This is processed separately from the AI’s decision making, and overrides it. If voicemail_message is set, then the AI will leave the message regardless of the voicemail_action.',
    type: FieldType.JSON,
    required: false,
  },
  retry: {
    id: 'retry',
    label: 'Retry',
    description:
      'If the call goes to voicemail, you can set up the call to retry, after a configurable delay.',
    type: FieldType.JSON,
    required: false,
  },
  max_duration: {
    id: 'max_duration',
    label: 'Max duration (minutes)',
    description:
      'When the call starts, a timer is set for the max_duration minutes. At the end of that timer, if the call is still active it will be automatically ended.',
    type: FieldType.NUMERIC,
    required: false,
  },
  record: {
    id: 'record',
    label: 'Record call',
    description:
      'When your call completes, you can access through the recording_url field in the call details or your webhook.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'Add any additional information you want to associate with the call. This data is accessible for all calls, regardless of if they are picked up or not. This can be used to track calls or add custom data to the call.',
    type: FieldType.JSON,
    required: false,
  },
  analysis_preset: {
    id: 'analysis_preset',
    label: 'Analysis preset',
    description:
      'The analysis preset UUID used to analyze the call, must be created on the analysis presets page.',
    type: FieldType.STRING,
    required: false,
  },
  available_tags: {
    id: 'available_tags',
    label: 'Available tags',
    description:
      'Comma-separated list of disposition tags. Upon call completion, the AI will evaluate the transcripts of the call and assign one of the tags to the “disposition_tag” field.',
    type: FieldType.STRING,
    required: false,
  },
  geospatial_dialing: {
    id: 'geospatial_dialing',
    label: 'Geospatial dialing',
    description: 'The geospatial dialing pool UUID.',
    type: FieldType.STRING,
    required: false,
  },
  precall_dtmf_sequence: {
    id: 'precall_dtmf_sequence',
    label: 'Pre-call DTMF sequence',
    description:
      'A sequence of DTMF digits that will be played before the call starts.',
    type: FieldType.STRING,
    required: false,
  },
  requestData: {
    id: 'requestData',
    label: 'Request data',
    description:
      'Any JSON you put in here will be visible to the AI agent during the call - and can also be referenced with Prompt Variables.',
    type: FieldType.JSON,
    required: false,
  },
  analysisSchema: {
    id: 'analysisSchema',
    label: 'Analysis schema',
    description:
      'Define a JSON schema for how you want to get information about the call - information like email addresses, names, appointment times or any other type of custom data.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: z.string().min(1),
  task: z.string().min(1),
  voice: z.string().optional(),
  background_track: BackgroundTrackEnum.optional(),
  first_sentence: z.string().optional(),
  wait_for_greeting: dropdownOptionsBooleanSchema.optional(),
  block_interruptions: dropdownOptionsBooleanSchema.optional(),
  interruption_threshold: z.number().optional(),
  model: ModelSchema.optional(),
  temperature: z.number().optional(),
  dynamic_data: JsonArraySchema.optional(),
  keywords: z
    .string()
    .transform((val) =>
      val
        .trim()
        .split(',')
        .map((keyword) => keyword.trim()),
    )
    .optional(),
  pronunciation_guide: JsonArraySchema.optional(),
  language: z.string().optional(),
  local_dialing: dropdownOptionsBooleanSchema.optional(),
  voicemail_sms: JsonObjectSchema.optional(),
  dispatch_hours: JsonObjectSchema.optional(),
  sensitive_voicemail_detection: dropdownOptionsBooleanSchema.optional(),
  noise_cancellation: dropdownOptionsBooleanSchema.optional(),
  ignore_button_press: dropdownOptionsBooleanSchema.optional(),
  timezone: z.string().optional(),
  tools: JsonArraySchema.optional(),
  voicemail_message: z.string().optional(),
  voicemail_action: VoicemailActionSchema.optional(),
  retry: JsonObjectSchema.optional(),
  max_duration: z.number().optional(),
  record: dropdownOptionsBooleanSchema.optional(),
  metadata: JsonObjectSchema.optional(),
  analysis_preset: z.string().optional(),
  available_tags: z
    .string()
    .transform((val) =>
      val
        .trim()
        .split(',')
        .map((tag) => tag.trim()),
    )
    .optional(),
  geospatial_dialing: z.string().optional(),
  precall_dtmf_sequence: z.string().optional(),
  requestData: JsonObjectSchema.optional(),
  analysisSchema: JsonObjectSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
