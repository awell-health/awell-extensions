import { createResource } from './createResource'

describe('createResource', () => {
  test('Should be defined', () => {
    expect(createResource).toBeDefined()
  })

  test('Should have the correct key', () => {
    expect(createResource.key).toBe('createResource')
  })

  test('Should have fields defined', () => {
    expect(createResource.fields).toBeDefined()
    expect(createResource.fields.resourceJson).toBeDefined()
  })

  test('Should have dataPoints defined', () => {
    expect(createResource.dataPoints).toBeDefined()
    expect(createResource.dataPoints?.resourceId).toBeDefined()
    expect(createResource.dataPoints?.resourceType).toBeDefined()
    expect(createResource.dataPoints?.bundleId).toBeDefined()
    expect(createResource.dataPoints?.bundleType).toBeDefined()
    expect(createResource.dataPoints?.resourceIds).toBeDefined()
  })
})
