import { TestHelpers } from '@awell-health/extensions-core'
import { updateTicket as action } from './updateTicket'
import { FieldsValidationSchema, preserveBlankLines } from './config/fields'

const mockZendeskAPIClient = {
  updateTicket: jest.fn().mockResolvedValue(undefined),
}

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockZendeskAPIClient),
}))

const settings = {
  subdomain: 'test-company',
  user_email: 'test@example.com',
  api_token: 'test-api-token',
  oauth_client_id: undefined,
  oauth_client_secret: undefined,
}

const basePayload = {
  settings,
  pathway: {
    id: 'test-pathway-id',
    definition_id: 'test-definition-id',
    tenant_id: 'test-tenant-id',
    org_slug: 'test-org-slug',
    org_id: 'test-org-id',
  },
  activity: { id: 'test-activity-id' },
  patient: { id: 'test-patient-id' },
}

const baseFields = {
  ticket_id: '42',
  comment: undefined,
  public: undefined,
  priority: undefined,
  status: undefined,
  add_tags: undefined,
  remove_tags: undefined,
}

describe('Update ticket - tags', () => {
  const parseTags = (tags: unknown): string[] | undefined =>
    FieldsValidationSchema.parse({ ...baseFields, add_tags: tags }).add_tags

  test.each([
    [undefined, undefined],
    ['', undefined],
    ['   ', undefined],
    ['[]', undefined],
    [', ,', undefined],
  ])('omits tags for empty input %j', (input, expected) => {
    expect(parseTags(input)).toEqual(expected)
  })

  test('parses comma-separated text, trimming, dropping empties and duplicates', () => {
    expect(parseTags(' kit_return, urgent ,,kit_return ')).toEqual([
      'kit_return',
      'urgent',
    ])
  })

  test('parses a JSON array string from a data point', () => {
    expect(parseTags('["a", "b", "a"]')).toEqual(['a', 'b'])
  })

  test('accepts an actual array', () => {
    expect(parseTags(['x', ' y '])).toEqual(['x', 'y'])
  })

  test('rejects malformed JSON arrays', () => {
    expect(() => parseTags('[not json')).toThrow()
  })

  test('rejects a tag that is both added and removed', () => {
    const result = FieldsValidationSchema.safeParse({
      ...baseFields,
      add_tags: 'a, b',
      remove_tags: 'b, c',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'The same tag cannot be both added and removed: b',
    )
  })
})

describe('Update ticket - comment formatting', () => {
  test('keeps single line breaks and puts a space on blank lines', () => {
    expect(preserveBlankLines('Line 1\nLine 2\n\nParagraph 2\n\n\nEnd')).toBe(
      'Line 1\nLine 2\n \nParagraph 2\n \n \nEnd',
    )
  })

  test('normalises Windows line endings', () => {
    expect(preserveBlankLines('a\r\n\r\nb')).toBe('a\n \nb')
  })
})

describe('Update ticket - request body', () => {
  const {
    extensionAction: updateTicket,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    mockZendeskAPIClient.updateTicket.mockReset()
    mockZendeskAPIClient.updateTicket.mockResolvedValue(undefined)
  })

  test('Adds and removes tags and posts a public comment by default', async () => {
    await updateTicket.onEvent!({
      payload: {
        ...basePayload,
        fields: {
          ...baseFields,
          comment: 'Summary\n\n- item one\n- item two',
          add_tags: 'kit_return, awell',
          remove_tags: '["needs_call"]',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('42', {
      comment: {
        body: 'Summary\n \n- item one\n- item two',
        public: true,
      },
      additional_tags: ['kit_return', 'awell'],
      remove_tags: ['needs_call'],
    })
    expect(onComplete).toHaveBeenCalledWith({})
  })

  test('Posts an internal note when the comment is not public', async () => {
    await updateTicket.onEvent!({
      payload: {
        ...basePayload,
        fields: { ...baseFields, comment: 'Hello', public: false },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('42', {
      comment: { body: 'Hello', public: false },
    })
  })

  test('Sends no tag changes when both tag fields are blank', async () => {
    await updateTicket.onEvent!({
      payload: {
        ...basePayload,
        fields: { ...baseFields, status: 'solved', add_tags: '', remove_tags: '[]' },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('42', {
      status: 'solved',
    })
  })

  test('Does not post an empty comment', async () => {
    await updateTicket.onEvent!({
      payload: {
        ...basePayload,
        fields: { ...baseFields, comment: '   ', priority: 'low' },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('42', {
      priority: 'low',
    })
  })
})
