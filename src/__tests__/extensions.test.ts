import type { Action, Fields, Settings } from '@awell-health/extensions-core'
import fs from 'fs'
import { isEmpty } from 'lodash'
import path from 'path'
import { extensions } from '../../extensions'

const extensionsDir = path.join(__dirname, '..', '..', 'extensions')
// Directory names on disk; an extension key must be one of them before we
// look for its files, so a key can never point outside `extensions/`.
const extensionDirs = new Set(
  fs
    .readdirSync(extensionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
)

const readExtensionFile = (extensionKey: string, fileName: string): string => {
  expect(extensionDirs.has(extensionKey)).toBe(true)
  return fs.readFileSync(path.join(extensionsDir, extensionKey, fileName), 'utf-8')
}

describe('Extensions', () => {
  describe('All extensions should have documentation (i.e. a README file in their root dir)', () => {
    test.each(extensions)('Check $key extension has documentation', (ext) => {
      const documentation = readExtensionFile(ext.key, 'README.md')
      expect(isEmpty(documentation.trim())).toBe(false)
    })
  })

  describe('All extensions should have a changelog (i.e. a CHANGELOG file in their root dir)', () => {
    test.each(extensions)('Check $key extension has changelog', (ext) => {
      const changelog = readExtensionFile(ext.key, 'CHANGELOG.md')
      expect(isEmpty(changelog.trim())).toBe(false)
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
