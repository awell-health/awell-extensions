import { getLastEmail } from '.'

describe('Elation: Get last email', () => {
  test('It should return undefined if emails is undefined', async () => {
    const res = getLastEmail(undefined)

    expect(res).toEqual(undefined)
  })

  test('It should return undefined if emails is empty array', async () => {
    const res = getLastEmail([])

    expect(res).toEqual(undefined)
  })

  test('It should pick the last email address', async () => {
    const res = getLastEmail([
      {
        email: 'john@doe.com',
        created_date: '2016-10-10T23:31:49',
        deleted_date: null,
      },
      {
        email: 'doe@john.com',
        created_date: '2016-10-10T23:31:49',
        deleted_date: '2016-10-10T23:31:49',
      },
    ])

    expect(res).toEqual('john@doe.com')
  })
})
