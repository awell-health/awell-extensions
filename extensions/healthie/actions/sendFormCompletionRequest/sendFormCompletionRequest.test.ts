import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { sendFormCompletionRequest } from '../sendFormCompletionRequest'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

const sampleFormCompletion = {
  form: 'form-template-1',
  recipient_ids: 'patient-1',
  is_recurring: undefined,
  frequency: undefined,
  monthday: undefined,
  weekday: undefined,
  hour: undefined,
  minute: undefined,
  period: undefined,
  recurrence_ends: false,
  ends_on: undefined,
}

const samplePayload = generateTestPayload({
  fields: {
    form_id: 'form-template-1',
    healthie_patient_id: 'patient-1',
    is_recurring: undefined,
    frequency: undefined,
    monthday: undefined,
    weekday: undefined,
    hour: undefined,
    minute: undefined,
    period: undefined,
    ends_on: undefined,
  },
  settings: {
    apiKey: 'apiKey',
    apiUrl: 'test-url',
  },
})

describe('sendFormCompletionRequest action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should send form completion request', async () => {
    await sendFormCompletionRequest.onActivityCreated!(
      samplePayload,
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.createFormCompletionRequest).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  test.each([
    { endsOnInput: '1990-01-01', endsOnExpected: '1990-01-01' },
    { endsOnInput: '2011-10-05T14:48:00.000Z', endsOnExpected: '2011-10-05' },
    { endsOnInput: '06 August 2015 14:48 UTC', endsOnExpected: '2015-08-06' },
  ])(
    '$#. Should set "recurrence_ends" to "true" and "ends_on" to $endsOnExpected when provided with $endsOnInput"',
    async ({ endsOnInput, endsOnExpected }) => {
      await sendFormCompletionRequest.onActivityCreated!(
        {
          ...samplePayload,
          fields: {
            ...samplePayload.fields,
            is_recurring: true,
            frequency: 'Daily',
            hour: 1,
            minute: 1,
            period: 'PM',
            ends_on: endsOnInput,
          },
        },
        onComplete,
        onError
      )
      expect(mockGetSdkReturn.createFormCompletionRequest).toHaveBeenCalledWith(
        {
          input: {
            ...sampleFormCompletion,
            is_recurring: true,
            frequency: 'Daily',
            hour: '1',
            minute: '1',
            period: 'PM',
            recurrence_ends: true,
            ends_on: endsOnExpected,
          },
        }
      )
      expect(onComplete).toHaveBeenCalled()
    }
  )

  describe('Frequency validation', () => {
    describe('No recurring', () => {
      test.each([false, undefined])(
        'Should call onComplete when is_recurring is %p and rest is undefined',
        async (value) => {
          await sendFormCompletionRequest.onActivityCreated!(
            {
              ...samplePayload,
              fields: {
                ...samplePayload.fields,
                is_recurring: value,
              },
            },
            onComplete,
            onError
          )

          expect(onComplete).toHaveBeenCalled()
          expect(
            mockGetSdkReturn.createFormCompletionRequest
          ).toHaveBeenCalledWith({
            input: {
              ...sampleFormCompletion,
              is_recurring: false,
            },
          })
        }
      )
    })

    describe('Frequency = daily', () => {
      test.each([
        {
          hour: 1,
          minute: 1,
          period: 'am',
        },
        {
          hour: '1',
          minute: '1',
          period: 'PM',
        },
      ])('Should call onComplete when %p', async (value) => {
        await sendFormCompletionRequest.onActivityCreated!(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              is_recurring: true,
              frequency: 'daily',
              ...(value as any),
            },
          },
          onComplete,
          onError
        )

        expect(onComplete).toHaveBeenCalled()
        expect(
          mockGetSdkReturn.createFormCompletionRequest
        ).toHaveBeenCalledWith({
          input: {
            ...sampleFormCompletion,
            is_recurring: true,
            frequency: 'Daily',
            hour: String(value.hour),
            minute: String(value.minute),
            period: value.period.toUpperCase(),
          },
        })
      })
    })

    describe('Frequency = weekly', () => {
      test.each([
        {
          weekday: 'Monday',
          weekdayActual: 'Monday',
        },
        {
          weekday: 'tuesday',
          weekdayActual: 'Tuesday',
        },
        {
          weekday: 'wednesdaY',
          weekdayActual: 'Wednesday',
        },
      ])('Should call onComplete when %p', async (value) => {
        await sendFormCompletionRequest.onActivityCreated!(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              is_recurring: true,
              frequency: 'weekly',
              weekday: value.weekday,
            },
          },
          onComplete,
          onError
        )

        expect(
          mockGetSdkReturn.createFormCompletionRequest
        ).toHaveBeenCalledWith({
          input: {
            ...sampleFormCompletion,
            is_recurring: true,
            frequency: 'Weekly',
            weekday: value.weekdayActual,
          },
        })
        expect(onComplete).toHaveBeenCalled()
      })
    })

    describe('Frequency = monthly', () => {
      test('Should call onComplete when "monthday" is not empty', async () => {
        await sendFormCompletionRequest.onActivityCreated!(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              is_recurring: true,
              frequency: 'monthly',
              monthday: '27th',
            },
          },
          onComplete,
          onError
        )

        expect(onComplete).toHaveBeenCalled()
        expect(
          mockGetSdkReturn.createFormCompletionRequest
        ).toHaveBeenCalledWith({
          input: {
            ...sampleFormCompletion,
            is_recurring: true,
            frequency: 'Monthly',
            monthday: '27th',
          },
        })
      })
    })
  })
})
