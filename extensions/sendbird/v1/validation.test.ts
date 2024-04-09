import { mockedUserData } from './client/__mocks__'
import {
  CustomFieldsValidationSchema,
  JsonStringValidationSchema,
  MetadataValidationSchema,
} from './validation'

describe('JsonString validation', () => {
  test.each([
    {
      value: JSON.stringify({
        v1: '1',
      }),
    },
  ])('$#. Should validate when json equals "$value"', async ({ value }) => {
    expect(() => {
      JsonStringValidationSchema.parse(value)
    }).not.toThrow()
  })

  test('Should throw error when JSON is not object', async () => {
    expect(() => {
      JsonStringValidationSchema.parse(
        JSON.stringify([
          {
            v1: '1',
          },
        ])
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: 'The value should represent an object',
          }),
        ],
      })
    )
  })

  test('Should throw error when key has a comma character ","', async () => {
    expect(() => {
      JsonStringValidationSchema.parse(
        JSON.stringify({
          'v,1': '1',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: 'Each key of the JSON must not have a comma',
          }),
        ],
      })
    )
  })
})

describe('Metadata validation', () => {
  test.each([
    { value: '' },
    { value: JSON.stringify(mockedUserData.metadata) },
    {
      value: JSON.stringify({
        v1: '1',
        v2: '2',
        v3: '3',
        v4: '4',
        v5: '5',
      }),
    },
  ])('$#. Should validate when metadata equals "$value"', async ({ value }) => {
    expect(() => {
      MetadataValidationSchema.parse(value)
    }).not.toThrow()
  })

  test('Should throw error when metadata has more than 5 keys', async () => {
    expect(() => {
      MetadataValidationSchema.parse(
        JSON.stringify({
          v1: '1',
          v2: '2',
          v3: '3',
          v4: '4',
          v5: '5',
          v6: '6',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: 'JSON should have maximum of 5 key-value items',
          }),
        ],
      })
    )
  })

  test('Should throw error when value is not string', async () => {
    expect(() => {
      MetadataValidationSchema.parse(
        JSON.stringify({
          v1: 1,
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: 'The value of each JSON key must be a string',
          }),
        ],
      })
    )
  })

  test('Should throw error when key is longer than 128 characters', async () => {
    expect(() => {
      MetadataValidationSchema.parse(
        JSON.stringify({
          abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789:
            '1',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: 'Each key of the JSON must not exceed 128 characters',
          }),
        ],
      })
    )
  })

  test('Should throw error when value is longer than 190 characters', async () => {
    expect(() => {
      MetadataValidationSchema.parse(
        JSON.stringify({
          v1: 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message:
              'The value of each JSON key must not exceed 190 characters',
          }),
        ],
      })
    )
  })
})

describe('CustomFields validation', () => {
  test.each([
    { value: '' },
    { value: JSON.stringify(mockedUserData.metadata) },
    {
      value: JSON.stringify({
        v1: '1',
        v2: '2',
        v3: '3',
        v4: '4',
        v5: '5',
        v6: '6',
        v7: '7',
        v8: '8',
        v9: '9',
        v10: '10',
        v11: '11',
        v12: '12',
        v13: '13',
        v14: '14',
        v15: '15',
        v16: '16',
        v17: '17',
        v18: '18',
        v19: '19',
        v20: '20',
      }),
    },
  ])(
    '$#. Should validate when custom fields equals "$value"',
    async ({ value }) => {
      expect(() => {
        CustomFieldsValidationSchema.parse(value)
      }).not.toThrow()
    }
  )

  test('Should throw error when custom fields has more than 20 keys', async () => {
    expect(() => {
      CustomFieldsValidationSchema.parse(
        JSON.stringify({
          v1: '1',
          v2: '2',
          v3: '3',
          v4: '4',
          v5: '5',
          v6: '6',
          v7: '7',
          v8: '8',
          v9: '9',
          v10: '10',
          v11: '11',
          v12: '12',
          v13: '13',
          v14: '14',
          v15: '15',
          v16: '16',
          v17: '17',
          v18: '18',
          v19: '19',
          v20: '20',
          v21: '21',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message:
              'The Customer object in Sendbird can only support a maximum of 20 custom fields',
          }),
        ],
      })
    )
  })

  test('Should throw error when key is longer than 20 characters', async () => {
    expect(() => {
      CustomFieldsValidationSchema.parse(
        JSON.stringify({
          abcdefghijklmnopqrstuvwxyz0123456789: '1',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: expect.stringContaining(
              `The length of each JSON field's key must not exceed 20 characters. Please fix the following keys:`
            ),
          }),
        ],
      })
    )
  })

  test('Should throw error when value is longer than 190 characters', async () => {
    expect(() => {
      CustomFieldsValidationSchema.parse(
        JSON.stringify({
          v1: 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789',
        })
      )
    }).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            message: expect.stringContaining(
              `The value of each JSON field must not exceed 190 characters. Please fix the following values:`
            ),
          }),
        ],
      })
    )
  })
})
