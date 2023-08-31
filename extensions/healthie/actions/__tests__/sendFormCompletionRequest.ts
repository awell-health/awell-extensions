import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { sendFormCompletionRequest } from '../sendFormCompletionRequest'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

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
    await sendFormCompletionRequest.onActivityCreated(
      samplePayload,
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.createFormCompletionRequest).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  describe('Frequency validation', () => {
    describe('No recurring', () => {
      test.each([false, undefined])(
        'Should call onComplete when is_recurring is %p and rest is undefined',
        async (value) => {
          await sendFormCompletionRequest.onActivityCreated(
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
        await sendFormCompletionRequest.onActivityCreated(
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
        await sendFormCompletionRequest.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              is_recurring: true,
              frequency: 'weekly',
              hour: 1,
              minute: 1,
              period: 'PM',
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
            hour: '1',
            minute: '1',
            period: 'PM',
            weekday: value.weekdayActual,
          },
        })
        expect(onComplete).toHaveBeenCalled()
      })
    })

    describe('Frequency = monthly', () => {
      test('Should call onComplete when "monthday" is not empty', async () => {
        await sendFormCompletionRequest.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              is_recurring: true,
              frequency: 'monthly',
              hour: 1,
              minute: 1,
              period: 'PM',
              weekday: 'monday',
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
            hour: '1',
            minute: '1',
            period: 'PM',
            weekday: 'Monday',
            monthday: '27th',
          },
        })
      })
    })
  })
})
