import { type Schema } from '@awell-health/extensions-core'

export const schemas: Record<string, Schema> = {
  example: {
    $schema: 'http://json-schema.org/draft-06/schema#',
    title: 'example',
    description:
      'A schema for validating a mock object with various property types',
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'A greeting message',
      },
      number: {
        type: 'integer',
        description: 'A numeric value',
      },
      array: {
        type: 'array',
        description: 'An array of integers',
        items: {
          type: 'integer',
        },
      },
      nested: {
        type: 'object',
        description: 'A nested object with a key-value pair',
        properties: {
          key: {
            type: 'string',
          },
        },
        required: ['key'],
      },
      boolean: {
        type: 'boolean',
        description: 'A boolean value',
      },
    },
    required: ['message', 'number', 'array', 'nested', 'boolean'],
  },
}
