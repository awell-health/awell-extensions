import { ZodError } from 'zod'
import { icd } from '../icd'
import { generateTestPayload } from '../../../../../src/tests'

describe('Sending a correct input for icd', () => {
  test('Should pass validation', async () => {
    const onComplete = jest.fn()
    await icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '["A01", "A02"]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          codes: JSON.stringify([
            'Intestinal infectious diseases',
            'Intestinal infectious diseases',
          ]),
        }),
      })
    )
  })

  test('Should pass validation', async () => {
    const onComplete = jest.fn()
    await icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '["A01.2", "A02.4"]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          codes: JSON.stringify([
            'Intestinal infectious diseases',
            'Intestinal infectious diseases',
          ]),
        }),
      })
    )
  })

  test('Should return blank', async () => {
    const onComplete = jest.fn()
    await icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '[" "]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        codes: JSON.stringify([]),
        stringResponse: 'Blank',
      },
    })
  })

  test('Should return tfu', async () => {
    const onComplete = jest.fn()
    await icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '["E12"]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        codes: JSON.stringify(['Diabetes mellitus']),
        stringResponse: 'TFU',
      },
    })
  })

  test('Should fail validation', async () => {
    const onComplete = jest.fn()
    const resp = icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '["A01", "A02", "invalid"]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    await expect(resp).rejects.toThrowError(ZodError)
  })

  test('Should fail validation', async () => {
    const onComplete = jest.fn()
    const resp = icd.onActivityCreated(
      generateTestPayload({
        fields: {
          icd_codes: '["A01|A02"]',
        },
        settings: {},
      }),
      onComplete,
      jest.fn()
    )
    await expect(resp).rejects.toThrowError(ZodError)
  })
})
