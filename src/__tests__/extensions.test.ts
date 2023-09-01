import type { Action, Fields, Settings } from '@awell-health/extensions-core'
import { isEmpty } from 'lodash'
import { extensions } from '../../extensions'
import {
  getExtensionDocumentation,
  getExtensionChangelog,
} from '../documentation'

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
  describe('all extension actions have fields labeled correctly', () => {
    extensions.forEach(
      // "Check $key extension's actions use fields whose id match the key",
      (ext) => {
        Object.entries(ext.actions).forEach(
          ([actionKey, action]: [string, Action<Fields, Settings>]) => {
            if (Object.values(action.fields).length === 0) {
              return
            }
            test.each(Object.entries(action.fields))(
              `Checking fields in  ${ext.key}.${actionKey}, field id $id does not match`,
              (fieldKey, field) => {
                expect(field.id).toBe(fieldKey)
              }
            )
          }
        )
      }
    )
  })
})
