import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findFutureAppointment } from './findFutureAppointment'
import { addDays, addHours } from 'date-fns'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../src/lib/llm/openai/types'

jest.setTimeout(60000)

jest.mock('../../client')

describe.skip('findFutureAppointment - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(findFutureAppointment)

  const basePayload = {
    settings: {
      client_id: 'clientId',
      client_secret: 'clientSecret',
      username: 'username',
      password: 'password',
      auth_url: 'authUrl',
      base_url: 'baseUrl',
    },
    pathway: {
      id: 'test-flow-id',
      definition_id: 'whatever',
      tenant_id: '123',
      org_slug: 'org-slug',
      org_id: '123',
    },
    activity: {
      id: 'test-activity-id',
    },
    patient: {
      id: 'test-patient-id',
    },
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'

    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000,
    })

    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(appointmentsMock),
    }))
  })

  const logTestResult = (
    testName: string,
    prompt: string,
    found: boolean,
    appointmentId?: number,
  ) => {
    console.log(
      `Test "${testName}": ${found ? 'Found' : 'Did not find'} appointment${appointmentId ? ` with ID ${appointmentId}` : ''} for prompt "${prompt}"`,
    )
  }

  test('Should find a video appointment with real LLM', async () => {
    const prompt = 'Find my next video appointment'

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt,
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const response = (await onComplete).mock.calls[0][0]

    expect(response.data_points.appointmentExists).toBe('true')

    const appointmentData = JSON.parse(response.data_points.appointment)
    logTestResult('video appointment', prompt, true, appointmentData.id)

    expect(appointmentData.mode).toBe('VIDEO')

    expect(appointmentData).toHaveProperty('id')
    expect(appointmentData).toHaveProperty('scheduled_date')
    expect(appointmentData).toHaveProperty('status')

    expect(onError).not.toHaveBeenCalled()
  })

  test('Should attempt to find an appointment with date filtering', async () => {
    const prompt = 'Find an appointment for tomorrow'

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt,
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const response = (await onComplete).mock.calls[0][0]

    const found = response.data_points.appointmentExists === 'true'

    if (found) {
      const appointmentData = JSON.parse(response.data_points.appointment)
      logTestResult('date filtering', prompt, true, appointmentData.id)

      const appointmentDate = new Date(appointmentData.scheduled_date)
      expect(appointmentDate).toBeInstanceOf(Date)
      expect(appointmentDate.getTime()).toBeGreaterThan(new Date().getTime())
    } else {
      logTestResult('date filtering', prompt, false)
      console.log(
        "Note: LLM did not find an appointment for tomorrow - this is acceptable as it depends on the model's understanding",
      )
    }

    expect(onError).not.toHaveBeenCalled()
  })

  test('Should find an in-person appointment with real LLM if available', async () => {
    const mockAPIClient = makeAPIClient as jest.Mock
    const modifiedAppointments = [...appointmentsMock]
    modifiedAppointments[1].mode = 'IN_PERSON'

    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(modifiedAppointments),
    }))

    const prompt = 'Find my next in-person appointment'

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt,
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const response = (await onComplete).mock.calls[0][0]

    if (response.data_points.appointmentExists === 'true') {
      const appointmentData = JSON.parse(response.data_points.appointment)
      logTestResult('in-person appointment', prompt, true, appointmentData.id)

      expect(appointmentData.mode).toBe('IN_PERSON')
    } else {
      logTestResult('in-person appointment', prompt, false)
      console.log(
        'Note: LLM did not find the in-person appointment - this is acceptable',
      )
    }

    expect(onError).not.toHaveBeenCalled()
  })

  test('Should not find appointments with criteria that should not match', async () => {
    const prompt = 'Find my dermatology appointment for next Saturday at 3 AM'

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt,
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const response = (await onComplete).mock.calls[0][0]
    logTestResult(
      'non-matching criteria',
      prompt,
      response.data_points.appointmentExists === 'true',
    )

    expect(response.data_points.appointmentExists).toBe('false')
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle no appointments without calling OpenAI', async () => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue([]),
    }))

    const createOpenAISpy = jest.spyOn(
      require('../../../../src/lib/llm/openai/createOpenAIModel'),
      'createOpenAIModel',
    )

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find my next appointment',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(createOpenAISpy).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointment: undefined,
        appointmentExists: 'false',
        explanation: 'No future appointments found',
      },
    })
  })
})
