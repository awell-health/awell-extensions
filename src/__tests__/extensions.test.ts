import { isEmpty } from 'lodash'
import { extensions } from '../../extensions'
import { getExtensionDocumentation } from '../documentation'

describe('Extensions', () => {
  describe('All extensions should have documentation (i.e. a README file in their root dir)', () => {
    test.each(extensions)('Check $key extension has documentation', (ext) => {
      const documentation = getExtensionDocumentation(ext.key)
      expect(isEmpty(documentation)).toBe(false)
    })
  })
})
