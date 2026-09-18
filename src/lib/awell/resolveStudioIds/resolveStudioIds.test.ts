import { resolveStepId, resolveTrackId } from '.'
import { type AwellSdk } from '@awell-health/awell-sdk'

const mockQuery = jest.fn()
const awellSdk = {
  orchestration: { query: mockQuery },
} as unknown as AwellSdk

beforeEach(() => {
  mockQuery.mockReset()
})

describe('resolveTrackId', () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({
      careflowTracks: {
        tracks: [
          { id: 'CtCOBOm5HZP4', definition_id: 'dSk3J6wUbLH0vlZKg3jzr' },
        ],
      },
    })
  })

  test('maps a Studio definition ID to the runtime track ID', async () => {
    await expect(
      resolveTrackId({
        awellSdk,
        pathwayId: 'pathway-1',
        trackId: 'dSk3J6wUbLH0vlZKg3jzr',
      }),
    ).resolves.toBe('CtCOBOm5HZP4')
  })

  test('returns a runtime track ID unchanged', async () => {
    await expect(
      resolveTrackId({
        awellSdk,
        pathwayId: 'pathway-1',
        trackId: 'CtCOBOm5HZP4',
      }),
    ).resolves.toBe('CtCOBOm5HZP4')
  })

  test('throws when the track is not in the care flow', async () => {
    await expect(
      resolveTrackId({ awellSdk, pathwayId: 'pathway-1', trackId: 'nope' }),
    ).rejects.toThrow('Track "nope" not found in care flow pathway-1')
  })
})

describe('resolveStepId', () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({
      careflowActivities: {
        activities: [
          {
            object: { id: 'dSk3J6wUbLH0vlZKg3jzr', type: 'TRACK' },
            context: { step_id: null },
          },
          {
            object: { id: 'eGAhFfPCuQl1HcK03DUyJ', type: 'STEP' },
            context: { step_id: '9PpK498pKNWI' },
          },
        ],
      },
    })
  })

  test('maps a Studio definition ID to the runtime step ID', async () => {
    await expect(
      resolveStepId({
        awellSdk,
        pathwayId: 'pathway-1',
        stepId: 'eGAhFfPCuQl1HcK03DUyJ',
      }),
    ).resolves.toBe('9PpK498pKNWI')
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        careflowActivities: expect.objectContaining({
          __args: expect.objectContaining({
            filters: { activity_type: ['STEP'] },
          }),
        }),
      }),
    )
  })

  test('returns a runtime step ID unchanged', async () => {
    await expect(
      resolveStepId({
        awellSdk,
        pathwayId: 'pathway-1',
        stepId: '9PpK498pKNWI',
      }),
    ).resolves.toBe('9PpK498pKNWI')
  })

  test('throws when the step was never activated in the care flow', async () => {
    await expect(
      resolveStepId({ awellSdk, pathwayId: 'pathway-1', stepId: 'nope' }),
    ).rejects.toThrow('Step "nope" not found in care flow pathway-1')
  })
})
