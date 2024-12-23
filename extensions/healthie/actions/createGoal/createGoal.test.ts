import { testPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { addDays, format } from 'date-fns'
import { createGoal as actionInterface } from '.'
import { FieldsValidationSchema } from './config'

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        createGoal: { goal: { id: '99999' } },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - Create goal', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
  })

  test('Field validation', async () => {
    const futureDate = format(addDays(new Date(), 4), 'yyyy-MM-dd')

    const fields = {
      healthiePatientId: 'user-id',
      name: 'My new goal',
      titleLink: undefined,
      repeat: undefined,
      dueDate: futureDate,
    }

    const result = FieldsValidationSchema.safeParse(fields)

    if (!result.success) {
      console.log(result.error.errors)
    }

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        healthiePatientId: 'user-id',
        name: 'My new goal',
        titleLink: undefined,
        repeat: 'Once',
        dueDate: futureDate,
      })
    }
  })

  test('Should call onComplete', async () => {
    await action.onEvent({
      payload: {
        ...testPayload,
        fields: {
          healthiePatientId: '453019',
          name: 'My new goal',
          titleLink: undefined,
          repeat: undefined,
          dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        },
        settings: {
          apiUrl: 'https://staging-api.gethealthie.com/graphql',
          apiKey: 'apiKey',
        },
      },
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        createdGoalId: '99999',
      },
    })
  })
})
