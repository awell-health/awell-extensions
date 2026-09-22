import { resolveStepIds, resolveTrackIds } from '.'
import { type AwellSdk } from '@awell-health/awell-sdk'

const mockQuery = jest.fn()
const awellSdk = {
  orchestration: { query: mockQuery },
} as unknown as AwellSdk

beforeEach(() => {
  mockQuery.mockReset()
})

describe('resolveTrackIds', () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({
      careflowTracks: {
        tracks: [
          {
            id: 'old-runtime',
            definition_id: 'old-studio',
            start_date: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 'CtCOBOm5HZP4',
            definition_id: 'dSk3J6wUbLH0vlZKg3jzr',
            start_date: '2026-02-01T00:00:00.000Z',
          },
        ],
      },
    })
  })

  test('returns runtime IDs of the activated tracks, most recent first', async () => {
    await expect(
      resolveTrackIds({
        awellSdk,
        pathwayId: 'pathway-1',
        trackIds: ['never-activated', 'old-studio', 'dSk3J6wUbLH0vlZKg3jzr'],
      }),
    ).resolves.toEqual(['CtCOBOm5HZP4', 'old-runtime'])
  })

  test('accepts a runtime track ID as-is', async () => {
    await expect(
      resolveTrackIds({
        awellSdk,
        pathwayId: 'pathway-1',
        trackIds: ['CtCOBOm5HZP4'],
      }),
    ).resolves.toEqual(['CtCOBOm5HZP4'])
  })

  test('throws when none of the tracks were activated', async () => {
    await expect(
      resolveTrackIds({
        awellSdk,
        pathwayId: 'pathway-1',
        trackIds: ['a', 'b'],
      }),
    ).rejects.toThrow(
      'None of the tracks "a", "b" were found in care flow pathway-1',
    )
  })
})

describe('resolveStepIds', () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({
      careflowActivities: {
        activities: [
          {
            object: { id: 'dSk3J6wUbLH0vlZKg3jzr', type: 'TRACK' },
            context: { step_id: null },
          },
          // Same step activated twice
          {
            object: { id: 'eGAhFfPCuQl1HcK03DUyJ', type: 'STEP' },
            context: { step_id: '9PpK498pKNWI' },
          },
          {
            object: { id: 'eGAhFfPCuQl1HcK03DUyJ', type: 'STEP' },
            context: { step_id: '9PpK498pKNWI' },
          },
          {
            object: { id: 'K7EAy-tZpiP2maEIMmppO', type: 'STEP' },
            context: { step_id: 'EnDUW6j1Hw96' },
          },
        ],
      },
    })
  })

  test('returns unique runtime IDs of the activated steps and skips the rest', async () => {
    await expect(
      resolveStepIds({
        awellSdk,
        pathwayId: 'pathway-1',
        stepIds: ['never-activated', 'eGAhFfPCuQl1HcK03DUyJ', 'EnDUW6j1Hw96'],
      }),
    ).resolves.toEqual(['9PpK498pKNWI', 'EnDUW6j1Hw96'])
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

  test('throws when none of the steps were activated', async () => {
    await expect(
      resolveStepIds({ awellSdk, pathwayId: 'pathway-1', stepIds: ['nope'] }),
    ).rejects.toThrow(
      'None of the steps "nope" were found in care flow pathway-1',
    )
  })
})
