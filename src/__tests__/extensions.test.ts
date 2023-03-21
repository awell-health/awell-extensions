import { isEmpty } from 'lodash'
import { extensions } from '../../extensions'
import { getExtensionDocumentation, getExtensionChangelog } from '../documentation'

describe('Extensions', () => {
  describe('All extensions should have documentation (i.e. a README file in their root dir)', () => {
    test.each(extensions)('Check $key extension has documentation', (ext) => {
      const documentation = getExtensionDocumentation(ext.key)
      expect(isEmpty(documentation)).toBe(false)
    })
  })

  describe('All extensions should have a changelog (i.e. a CHANGELOG file in their root dir)', () => {
    test.each(extensions)('Check $key extension has changelog', (ext) => {
      const documentation = getExtensionChangelog(ext.key)
      expect(isEmpty(documentation)).toBe(false)
    })
  })
})
