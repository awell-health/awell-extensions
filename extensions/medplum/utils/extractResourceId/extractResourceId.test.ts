import { extractResourceId } from './extractResourceId'

describe('Extract FHIR resource ID', () => {
  test('Should work', async () => {
    const patientId = '123'
    const res = extractResourceId(`Patient/${patientId}`, 'Patient')

    expect(res).toBe('123')
  })

  test('Should work', async () => {
    const patientId = '123'
    const res = extractResourceId(`${patientId}`, 'Patient')

    expect(res).toBe('123')
  })

  test('Should work', async () => {
    const res = extractResourceId(`Patient/`, 'Patient')

    expect(res).toBe(null)
  })

  test('Should work', async () => {
    const res = extractResourceId(``, 'Patient')

    expect(res).toBe(null)
  })
})
