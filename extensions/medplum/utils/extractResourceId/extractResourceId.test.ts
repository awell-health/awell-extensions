import { extractResourceId } from './extractResourceId'

describe('Extract FHIR resource ID', () => {
  test('Should work', async () => {
    const patientId = '404bbc59-5b60-445d-808c-b2c7b2351d9b'
    const res = extractResourceId(`Patient/${patientId}`, 'Patient')

    expect(res).toBe(patientId)
  })

  test('Should work', async () => {
    const patientId = '404bbc59-5b60-445d-808c-b2c7b2351d9b'
    const res = extractResourceId(`${patientId}`, 'Patient')

    expect(res).toBe(patientId)
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
