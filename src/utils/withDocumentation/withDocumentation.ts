import { isNil } from 'lodash'
import {
  type Extension,
  type ExtensionWithDocumentation,
} from '../../../lib/types'
import { getAllExtensionReadmes } from '../getAllExtensionReadmes'

type WithDocumentationFunction = (
  extensions: Extension[]
) => ExtensionWithDocumentation[]

export const withDocumentation: WithDocumentationFunction = (extensions) => {
  const allReadmes = getAllExtensionReadmes()

  const addDocumentation = (
    extension: Extension
  ): ExtensionWithDocumentation => {
    const readMe = allReadmes.find(
      (readme) => readme.extensionKey === extension.key
    )
    const htmlDocs = isNil(readMe) ? '' : readMe.html

    return {
      ...extension,
      htmlDocs,
    }
  }

  return extensions.map(addDocumentation)
}
