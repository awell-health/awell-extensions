import { type DataPointPayload } from '@awell-health/awell-sdk'
import { type DeepPartial } from '../../../../../../src/lib/types'

export const getDataPointDateValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'eJqGaLgABZcI9sGJbjsZs',
        serialized_value: '2025-01-28T00:00:00.000Z',
        data_point_definition_id: 'mADXwoqwGjmH',
        valueType: 'DATE',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointStringValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'O0cMoOgVDqCLRARHREUoM',
        key: null,
        serialized_value: 'string',
        data_point_definition_id: 'KglssZfb21n9',
        valueType: 'STRING',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointNumberValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'sIMc6fS2epKroi9mh7fgE',
        key: null,
        serialized_value: '1',
        data_point_definition_id: 'SIZfxYVGUiJr',
        valueType: 'NUMBER',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointBooleanValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'O0cMoOgVDqCLRARHREUoM',
        key: null,
        serialized_value: 'true',
        data_point_definition_id: 'KglssZfb21n9',
        valueType: 'BOOLEAN',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointTelephoneValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'VRjWPqwdrWqcl0FukN4f1',
        key: null,
        serialized_value: '+32476581696',
        data_point_definition_id: 'yzgWKoeyCOwI',
        valueType: 'TELEPHONE',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointJsonValueMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: '7gTMfS0aqYkb4pMvCtd3M',
        key: null,
        serialized_value: '{"a":"hello"}',
        data_point_definition_id: 'yFxW1OXtGIwP',
        valueType: 'JSON',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }

export const getDataPointNumericValueWithMultipleValuesMock = {
  pathwayDataPoints: {
    success: true,
    dataPoints: [
      {
        id: 'Zv1Yee0CkavQ5QFQJ5Ld6',
        key: null,
        serialized_value: '2',
        data_point_definition_id: 'vDZ3yL1XaExS',
        valueType: 'NUMBER',
        date: '2025-01-28T10:02:51.119Z',
      },
      {
        id: 'MQ5en9qB95yKs4TPqGZP1',
        key: null,
        serialized_value: '1',
        data_point_definition_id: 'vDZ3yL1XaExS',
        valueType: 'NUMBER',
        date: '2025-01-28T10:02:50.658Z',
      },
    ],
  },
} satisfies { pathwayDataPoints: DeepPartial<DataPointPayload> }
