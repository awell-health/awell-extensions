import { elationMobilePhoneToE164 } from '.'

describe('Elation: mobile number in national format to E.164 format', () => {
  test('If mobile number is empty then it should return undefined', async () => {
    const res = elationMobilePhoneToE164('')

    expect(res).toEqual(undefined)
  })

  test('If mobile number is undefined then it should return undefined', async () => {
    const res = elationMobilePhoneToE164(undefined)

    expect(res).toEqual(undefined)
  })

  test('If mobile number is invalid then it should return undefined', async () => {
    const res = elationMobilePhoneToE164('12345678901432432')

    expect(res).toEqual(undefined)
  })

  test('If mobile number is a valid US number in national format then it should transform to E.164 format', async () => {
    const res = elationMobilePhoneToE164('(213) 373-4253')

    expect(res).toEqual('+12133734253')
  })

  test('If mobile number is a valid US number in E.164 format then it should return the phone number as is', async () => {
    const res = elationMobilePhoneToE164('+12133734253')

    expect(res).toEqual('+12133734253')
  })
})
