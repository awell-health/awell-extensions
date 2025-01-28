import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../tests'
import { getDataPointValue as action } from './getDataPointValue'
import {
  getDataPointStringValueMock,
  getDataPointBooleanValueMock,
  getDataPointDateValueMock,
  getDataPointJsonValueMock,
  getDataPointNumberValueMock,
  getDataPointTelephoneValueMock,
  getDataPointNumericValueWithMultipleValuesMock,
} from './__testdata__/getDataPointValue.mock'

jest.mock('@awell-health/awell-sdk')

describe('Awell Extension - Get Data Point Value', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('when at least one data point value is found for the given data point definition id', () => {
    describe('when the data point is a string', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointStringValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: 'string',
            valueBoolean: undefined,
            valueNumber: undefined,
            valueDate: undefined,
            valueTelephone: undefined,
            valueJson: undefined,
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('when the data point is a number', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointNumberValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: undefined,
            valueBoolean: undefined,
            valueNumber: '1',
            valueDate: undefined,
            valueTelephone: undefined,
            valueJson: undefined,
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('when the data point is a date', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointDateValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: undefined,
            valueBoolean: undefined,
            valueNumber: undefined,
            valueDate: '2025-01-28T00:00:00.000Z',
            valueTelephone: undefined,
            valueJson: undefined,
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('when the data point is a boolean', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointBooleanValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: undefined,
            valueBoolean: 'true',
            valueNumber: undefined,
            valueDate: undefined,
            valueTelephone: undefined,
            valueJson: undefined,
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('when the data point is a telephone', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointTelephoneValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: undefined,
            valueBoolean: undefined,
            valueNumber: undefined,
            valueDate: undefined,
            valueTelephone: '+32476581696',
            valueJson: undefined,
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('when the data point is json', () => {
      it('should call the onComplete callback with the data point value', async () => {
        const awellSdkMock = {
          orchestration: {
            query: jest.fn().mockResolvedValue(getDataPointJsonValueMock),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              careFlowId: 'care-flow-id',
              dataPointDefinitionId: 'data-point-definition-id',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            valueString: undefined,
            valueBoolean: undefined,
            valueNumber: undefined,
            valueDate: undefined,
            valueTelephone: undefined,
            valueJson: '{"a":"hello"}',
            valueStringsArray: undefined,
            valueNumbersArray: undefined,
          },
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })
  })

  describe('when multiple data point values are found for the given data point definition id', () => {
    it('should call the onComplete callback with the most recent data point value', async () => {
      const awellSdkMock = {
        orchestration: {
          query: jest
            .fn()
            .mockResolvedValue(getDataPointNumericValueWithMultipleValuesMock),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            careFlowId: 'care-flow-id',
            dataPointDefinitionId: 'data-point-definition-id',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          valueString: undefined,
          valueBoolean: undefined,
          valueNumber: '2',
          valueDate: undefined,
          valueTelephone: undefined,
          valueJson: undefined,
          valueStringsArray: undefined,
          valueNumbersArray: undefined,
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('when no data point value is found for the given data point definition id', () => {
    test('should call the onError callback', async () => {
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            pathwayDataPoints: {
              success: true,
              dataPoints: [],
            },
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            careFlowId: 'care-flow-id',
            dataPointDefinitionId: 'data-point-definition-id',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          {
            date: expect.any(String),
            text: {
              en: 'No data point values were found for the given data point definition id.',
            },
          },
        ]),
      })
    })
  })
})
