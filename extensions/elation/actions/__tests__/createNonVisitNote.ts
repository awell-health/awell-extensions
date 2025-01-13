import { createNonVisitNote } from '../createNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { nonVisitNoteSchema } from '../../validation/nonVisitNote.zod'

jest.mock('../../client')

describe('Create non-visit note action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return with correct data_points', async () => {
    await createNonVisitNote.onActivityCreated!(
      {
        fields: {
          patientId: nonVisitNoteResponseExample.patient,
          authorId: nonVisitNoteResponseExample.bullets[0].author,
          category: undefined,
          tags: undefined,
          text: nonVisitNoteResponseExample.bullets[0].text,
        },
        settings,
      } as any,
      onComplete,
      onError,
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        nonVisitNoteId: String(nonVisitNoteResponseExample.id),
        nonVisitNoteBulletId: String(nonVisitNoteResponseExample.bullets[0].id),
      },
    })
  })

  describe('nonVisitNoteSchema', () => {
    test('Should work undefined category', async () => {
      const test = nonVisitNoteSchema.parse({
        patient: 1,
        bullets: [{ text: 'Text', author: 2, category: undefined }],
        document_date: new Date().toISOString(),
        chart_date: new Date().toISOString(),
        tags: undefined,
      })

      expect(test).toEqual({
        type: 'nonvisit',
        patient: 1,
        bullets: [{ text: 'Text', author: 2, category: undefined }],
        document_date: expect.any(String),
        chart_date: expect.any(String),
        tags: undefined,
      })
    })
  })
})
