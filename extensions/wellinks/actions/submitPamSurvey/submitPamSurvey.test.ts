import { generateTestPayload } from '../../../../src/tests'
import {
  WellinksFlourishClientMockImplementation,
  WellinksFlourishClient,
} from '../../api/clients/__mocks__/wellinksFlourishClient'

import { mockSettings } from '../../__mocks__/config/settings'
import { submitPamSurvey } from './submitPamSurvey'
import { ZodError } from 'zod'

jest.mock('../../api/clients/wellinksFlourishClient', () => ({
  WellinksFlourishClient,
}))

describe('Submit PAM Survey', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call onError with a ZodError when the payload is invalid', async () => {
    const invalidPayload = generateTestPayload({
      fields: {
        language: undefined,
        adminDate: undefined,
        thirdPartyIdentifier: undefined,
        gender: undefined,
        age: undefined,
        pa1: undefined,
        pa2: undefined,
        pa3: undefined,
        pa4: undefined,
        pa5: undefined,
        pa6: undefined,
        pa7: undefined,
        pa8: undefined,
        pa9: undefined,
        pa10: undefined,
        pa11: undefined,
        pa12: undefined,
        pa13: undefined,
      },
      settings: mockSettings,
    })
    await expect(
      submitPamSurvey.onActivityCreated(invalidPayload, onComplete, onError)
    ).rejects.toThrowError(ZodError)
  })

  test('should call onComplete with a complete DataPoint set when the survey is succesfully submitted', async () => {
    const validPayload = generateTestPayload({
      fields: {
        language: 'en',
        adminDate: new Date().toDateString(),
        thirdPartyIdentifier: 'identifier',
        gender: 'male',
        age: 25,
        pa1: 1,
        pa2: 2,
        pa3: 3,
        pa4: 4,
        pa5: 5,
        pa6: 6,
        pa7: 7,
        pa8: 8,
        pa9: 9,
        pa10: 10,
        pa11: 11,
        pa12: 12,
        pa13: 13,
      },
      settings: mockSettings,
    })

    WellinksFlourishClientMockImplementation.survey.submit.mockImplementationOnce(
      () => {
        return {
          success: true,
          pamLevel: 1,
          pamScore: 1,
        }
      }
    )
    await submitPamSurvey.onActivityCreated(validPayload, onComplete, onError)
    expect(onError).not.toBeCalled()
    expect(onComplete).toHaveBeenNthCalledWith(1, {
      data_points: {
        pamLevel: '1',
        pamScore: '1',
        success: 'true',
      },
    })
  })

  test('should call onError when wellinksFlourishClient.survey.submit throws an error', async () => {
    const validPayload = generateTestPayload({
      fields: {
        language: 'en',
        adminDate: new Date().toDateString(),
        thirdPartyIdentifier: 'identifier',
        gender: 'male',
        age: 25,
        pa1: 1,
        pa2: 2,
        pa3: 3,
        pa4: 4,
        pa5: 5,
        pa6: 6,
        pa7: 7,
        pa8: 8,
        pa9: 9,
        pa10: 10,
        pa11: 11,
        pa12: 12,
        pa13: 13,
      },
      settings: mockSettings,
    })

    WellinksFlourishClientMockImplementation.survey.submit.mockImplementationOnce(
      () => {
        throw new Error('Test Error')
      }
    )
    await submitPamSurvey.onActivityCreated(validPayload, onComplete, onError)
    expect(onError).toHaveBeenNthCalledWith(1, {
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: 'Test Error',
          },
        }),
      ]),
    })
    expect(onComplete).not.toBeCalled()
  })
})
