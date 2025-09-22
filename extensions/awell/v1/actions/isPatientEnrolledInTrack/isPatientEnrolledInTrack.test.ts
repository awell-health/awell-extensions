import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../tests/constants'
import { ElementStatus, ElementType } from '../../gql/graphql'
import { isPatientEnrolledInTrack as actionInterface } from './isPatientEnrolledInTrack'
import { FieldsValidationSchema } from './config'

jest.mock('@awell-health/awell-sdk')

describe('Is patient enrolled in track action', () => {
  const {
    onComplete,
    onError,
    helpers,
    extensionAction: isPatientEnrolledInTrack,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
  })

  describe('Field validation', () => {
    test('Should require trackDefinitionId', () => {
      expect(() => {
        FieldsValidationSchema.parse({})
      }).toThrow()
    })

    test('Should accept valid trackDefinitionId', () => {
      expect(() => {
        FieldsValidationSchema.parse({
          trackDefinitionId: 'track-def-123',
        })
      }).not.toThrow()
    })
  })

  test('Should return all enrollment states when track has been enrolled, is active, and is scheduled', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayElements: {
            elements: [
              {
                definition_id: 'test-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Active,
                start_date: '2023-01-01T00:00:00Z',
                end_date: null,
              },
              {
                definition_id: 'test-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Done,
                start_date: '2022-12-01T00:00:00Z',
                end_date: '2022-12-31T23:59:59Z',
              },
              {
                definition_id: 'test-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Scheduled,
                start_date: '2024-01-01T00:00:00Z',
                end_date: null,
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInTrack.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'test-pathway-id',
        },
        fields: {
          trackDefinitionId: 'test-track-definition-id',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        has_been_enrolled_in_track: 'true',
        is_enrolled_in_track: 'true',
        track_is_scheduled: 'true',
        track_scheduled_date: '2024-01-01T00:00:00Z',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return false for all states when track not found', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayElements: {
            elements: [
              {
                definition_id: 'different-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Active,
                start_date: '2023-01-01T00:00:00Z',
                end_date: null,
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInTrack.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'test-pathway-id',
        },
        fields: {
          trackDefinitionId: 'test-track-definition-id',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        has_been_enrolled_in_track: 'false',
        is_enrolled_in_track: 'false',
        track_is_scheduled: 'false',
        track_scheduled_date: null,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return earliest scheduled date when multiple scheduled tracks exist', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayElements: {
            elements: [
              {
                definition_id: 'test-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Scheduled,
                start_date: '2024-03-01T00:00:00Z',
                end_date: null,
              },
              {
                definition_id: 'test-track-definition-id',
                type: ElementType.Track,
                status: ElementStatus.Scheduled,
                start_date: '2024-01-01T00:00:00Z', // Earlier date
                end_date: null,
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInTrack.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'test-pathway-id',
        },
        fields: {
          trackDefinitionId: 'test-track-definition-id',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        has_been_enrolled_in_track: 'false',
        is_enrolled_in_track: 'false',
        track_is_scheduled: 'true',
        track_scheduled_date: '2024-01-01T00:00:00Z', // Earliest date
      },
    })
  })

  test('Should call pathwayElements query with correct parameters', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayElements: { elements: [] },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInTrack.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'test-pathway-id',
        },
        fields: {
          trackDefinitionId: 'test-track-definition-id',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sdkMock.orchestration.query).toHaveBeenCalledWith({
      pathwayElements: {
        __args: {
          pathway_id: 'test-pathway-id',
        },
        elements: {
          definition_id: true,
          type: true,
          status: true,
          start_date: true,
          end_date: true,
        },
      },
    })
  })
})
