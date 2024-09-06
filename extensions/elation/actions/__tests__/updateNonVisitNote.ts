import { updateNonVisitNote } from '../updateNonVisitNote'
import { nonVisitNoteResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Update non-visit note action', () => {
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

  const exampleInput = {
    nonVisitNoteId: 1,
    nonVisitNoteBulletId: 1,
    authorId: 1,
    text: 'abc',
    category: 'Problem',
    chartDate: '2023-01-01',
    documentDate: '2023-01-01',
    patientId: 101,
    practiceId: 102,
    tags: '1,',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      input: {
        nonVisitNoteId: nonVisitNoteResponseExample.id,
        nonVisitNoteBulletId: nonVisitNoteResponseExample.bullets[0].id,
        authorId: nonVisitNoteResponseExample.bullets[0].author,
        text: nonVisitNoteResponseExample.bullets[0].text,
        category: nonVisitNoteResponseExample.bullets[0].category,
        chartDate: nonVisitNoteResponseExample.chart_date,
        documentDate: nonVisitNoteResponseExample.document_date,
        patientId: nonVisitNoteResponseExample.patient,
        practiceId: nonVisitNoteResponseExample.patient,
        tags:
          nonVisitNoteResponseExample.tags?.length !== 0
            ? nonVisitNoteResponseExample.tags?.join(',')
            : undefined,
      },
    },
    {
      input: exampleInput,
    },
    {
      input: {
        nonVisitNoteId: 1,
        nonVisitNoteBulletId: undefined,
        authorId: undefined,
        text: undefined,
        category: undefined,
        chartDate: undefined,
        documentDate: undefined,
        patientId: undefined,
        practiceId: 1,
        tags: undefined,
      },
    },
  ] as Array<{
    input: {
      nonVisitNoteId: number
      nonVisitNoteBulletId: number
      authorId: number
      text: string
      category: string
      chartDate: string
      documentDate: string
      patientId: number
      practiceId: number
      tags: string
    }
  }>)(
    '$#. Should successfully update and execute onComplete when input is $input',
    async ({ input }) => {
      await updateNonVisitNote.onActivityCreated!(
        {
          fields: {
            ...input,
          },
          settings,
        } as any,
        onComplete,
        onError
      )
      expect(onComplete).toHaveBeenCalled()
    }
  )
  it('make sure a signed note is updated correctly', async () => {
    await updateNonVisitNote.onActivityCreated!(
      {
        fields: {
          ...exampleInput,
          signed_by: 1,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
