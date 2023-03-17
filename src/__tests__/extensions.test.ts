import { isEmpty } from 'lodash'
import { extensions } from '../../extensions'

describe('Extensions', () => {
  describe('All extensions should have documentation (i.e. a README file in their root dir)', () => {
    test.each(extensions)('Check $key extension has documentation', (ext) => {
      expect(ext).toHaveProperty('htmlDocs')
      expect(isEmpty(ext.htmlDocs)).toBe(false)
    })
  })
})
