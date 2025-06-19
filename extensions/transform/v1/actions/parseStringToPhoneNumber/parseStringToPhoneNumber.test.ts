import { ZodError } from 'zod'
import { parseStringToPhoneNumber } from '.'
import { generateTestPayload } from '../../../../../tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse text to phone number', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(parseStringToPhoneNumber)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the phone number is in E164 format', () => {
    it('Should return the number as is', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            text: '+14155556786',
            countryCallingCode: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          phoneNumber: '+14155556786',
        },
        events: expect.any(Array),
      })
    })
  })

  describe('When the phone number is not in E164 format', () => {
    describe('When the country calling code is provided', () => {
      it('Should return the number with the country calling code prepended', async () => {
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              text: '7046518034',
              countryCallingCode: 1,
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            phoneNumber: '+17046518034',
          },
          events: expect.any(Array),
        })
      })
    })

    describe('When the country calling code is not provided', () => {
      it('Should throw a ZodError', async () => {
        try {
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                text: '7046518034',
                countryCallingCode: undefined,
              },
              settings: {},
            }),
            onComplete,
            onError,
            helpers,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError)
          const zodError = error as ZodError

          expect(zodError.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Phone number is invalid (INVALID_COUNTRY)',
              }),
            ]),
          )
        }
      })
    })
  })

  describe('When the input phone number is not a valid phone number', () => {
    describe('When the country calling code is not provided', () => {
      it('Should throw a ZodError', async () => {
        try {
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                text: '123',
                countryCallingCode: undefined,
              },
              settings: {},
            }),
            onComplete,
            onError,
            helpers,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError)
          const zodError = error as ZodError

          expect(zodError.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Phone number is invalid (INVALID_COUNTRY)',
              }),
            ]),
          )
        }
      })
    })

    describe('When the country calling code is provided', () => {
      it('Should throw a ZodError', async () => {
        try {
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                text: '123',
                countryCallingCode: 1,
              },
              settings: {},
            }),
            onComplete,
            onError,
            helpers,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError)
          const zodError = error as ZodError

          expect(zodError.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Phone number is invalid (TOO_SHORT)',
              }),
            ]),
          )
        }
      })
    })
  })
})
